import { NextResponse, type NextRequest } from "next/server";


/** `__Host-` in production, which a sibling subdomain can't set, and the plain name on localhost */
const SESSION_COOKIES = ["__Host-oreo_session", "oreo_session"];
const development = process.env.NODE_ENV === "development";

const PROXIED = /^\/api\/v1\/(auth|dashboard|status)(\/|$)/;
const LOCAL_API = new Set(["/api/search"]);
const SNEAKY = /%2e|%2f|%5c|\\|\/\.\.?(\/|$)/i;


// Scripts need this request's nonce, so injected markup can't run. Any https image is allowed because embed previews show user links.
function contentSecurityPolicy(nonce: string) {
    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src 'self'${development ? " ws: wss:" : ""}`,
        "media-src 'self' https:",
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://e.widgetbot.io",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        "manifest-src 'self'",
        "worker-src 'self' blob:",
        ...(development ? [] : ["upgrade-insecure-requests"])
    ].join("; ");
}

// Next strips its prefetch header before middleware runs, so fetch metadata is the reliable signal
function isBackground(request: NextRequest) {
    const mode = request.headers.get("sec-fetch-mode");
    return Boolean(
        request.headers.get("next-router-prefetch") ||
            request.headers.get("rsc") ||
            request.headers.get("purpose") === "prefetch" ||
            request.headers.get("sec-purpose")?.includes("prefetch") ||
            (mode && mode !== "navigate")
    );
}


// Checked on the normalised path the proxy will request, and anything that could normalise into something else is refused
function guardApi(request: NextRequest) {
    const raw = request.url.slice(request.nextUrl.origin.length);
    const pathname = new URL(request.url).pathname;
    if (SNEAKY.test(raw.split("?")[0] ?? "") || !PROXIED.test(pathname)) {
        return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
}


export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    if (LOCAL_API.has(pathname)) return NextResponse.next();
    if (pathname.startsWith("/api/")) return guardApi(request);

    // Only checks the cookie exists. The API validates it on every call and the client logs in again on a 401.
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        const session = SESSION_COOKIES.some((name) => request.cookies.get(name)?.value);
        if (!session) {
            // A prefetch must not start a login, because it would overwrite the OAuth state cookie
            if (isBackground(request)) return new NextResponse(null, { status: 204 });
            const url = request.nextUrl.clone();
            url.pathname = "/api/v1/auth/login";
            url.search = `?redirect=${encodeURIComponent(`${pathname}${search}`)}`;
            return NextResponse.redirect(url);
        }
    }

    const nonce = btoa(crypto.randomUUID());
    const policy = contentSecurityPolicy(nonce);

    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", policy);

    const response = NextResponse.next({ request: { headers } });
    response.headers.set("Content-Security-Policy", policy);
    return response;
}


export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/:path*",
        "/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpe?g|gif|svg|ico|webp|avif|json|md|txt|xml|webmanifest|woff2?|mp4|webm)$).*)"
    ]
};

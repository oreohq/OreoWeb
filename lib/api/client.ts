import { loginUrl } from "@/lib/urls";


// Same-origin rewrite, so the session cookie stays first-party and writes carry our Origin for the CSRF check
export type ApiErrorCode =
    | "unauthorized"
    | "forbidden"
    | "bot_missing"
    | "no_slots"
    | "no_premium"
    | "premium_required"
    | "premium_taken"
    | "premium_locked"
    | "missing_permissions"
    | "csrf"
    | "conflict"
    | "not_found"
    | "bad_request"
    | "rate_limited"
    | "unavailable"
    | "internal_error"
    | "network"
    | (string & {});

type Envelope<T> =
    | { success: true, data: T }
    | { success: false, code?: string, message?: string, details?: unknown };


export class ApiError extends Error {
    readonly status: number;
    readonly code: ApiErrorCode;
    readonly details: unknown;
    readonly retryAfter: number | null;

    constructor(status: number, code: ApiErrorCode, message: string, details?: unknown, retryAfter: number | null = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
        this.retryAfter = retryAfter;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
    if (isApiError(error)) {
        if (error.code === "rate_limited" && error.retryAfter) {
            return `${error.message} Try again in ${error.retryAfter}s.`;
        }
        return error.message || fallback;
    }
    return fallback;
}

export function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === "AbortError";
}


const BASE = "/api/v1";

const STATUS_CODES: Record<number, ApiErrorCode> = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    429: "rate_limited",
    503: "unavailable"
};

function fallbackMessage(status: number) {
    if (status === 401) return "You need to log in first.";
    if (status === 429) return "Too many requests, slow down.";
    if (status >= 500) return "Oreo's servers are having a moment. Please try again shortly.";
    return "Something went wrong. Please try again.";
}


interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
    noLoginRedirect?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const hasBody = options.body !== undefined;
    let response: Response;

    try {
        response = await fetch(`${BASE}${path}`, {
            method: options.method ?? "GET",
            headers: hasBody ? { "Content-Type": "application/json" } : undefined,
            body: hasBody ? JSON.stringify(options.body) : undefined,
            credentials: "same-origin",
            cache: "no-store",
            signal: options.signal
        });
    } catch (error) {
        if (isAbortError(error)) throw error;
        throw new ApiError(0, "network", "Couldn't reach Oreo. Check your connection and try again.");
    }

    if (response.status === 204) return undefined as T;

    const payload = (await response.json().catch(() => null)) as Envelope<T> | null;
    // Cancelled while the body was still loading, which is an abort, not a broken response
    if (options.signal?.aborted) throw new DOMException("The request was cancelled.", "AbortError");
    if (response.ok && payload?.success) return payload.data;

    const failure = payload && payload.success === false ? payload : null;
    const header = Number(response.headers.get("Retry-After"));
    const detailed = (failure?.details as { retryAfter?: unknown } | undefined)?.retryAfter;
    const retryAfter = Number.isFinite(header) && header > 0 ? header : typeof detailed === "number" ? detailed : null;

    const error = new ApiError(
        response.status,
        failure?.code ?? STATUS_CODES[response.status] ?? (response.status >= 500 ? "internal_error" : "bad_request"),
        failure?.message || fallbackMessage(response.status),
        failure?.details,
        retryAfter
    );

    if (response.status === 401 && !options.noLoginRedirect) redirectToLogin();
    throw error;
}


let redirecting = false;
const LOGIN_ATTEMPTS = "oreo:login-attempts";

function redirectToLogin() {
    if (typeof window === "undefined" || redirecting) return;

    let recent: number[] = [];
    try {
        const stored = JSON.parse(window.sessionStorage.getItem(LOGIN_ATTEMPTS) ?? "[]") as unknown;
        recent = Array.isArray(stored) ? stored.filter((at): at is number => typeof at === "number" && Date.now() - at < 60_000) : [];
    } catch {
        // Storage is blocked. There is no loop protection, but the login still works.
    }
    if (recent.length >= 2) {
        window.dispatchEvent(new CustomEvent("oreo:session-expired"));
        return;
    }
    try {
        window.sessionStorage.setItem(LOGIN_ATTEMPTS, JSON.stringify([...recent, Date.now()]));
    } catch {
    }

    redirecting = true;
    // The page can stay when someone answers "Stay" to the unsaved changes prompt, so a later 401 can try again
    window.setTimeout(() => (redirecting = false), 4000);
    const here = `${window.location.pathname}${window.location.search}`;
    window.location.assign(loginUrl(here.startsWith("/dashboard") ? here : "/dashboard"));
}

export function resetLoginAttempts() {
    try {
        window.sessionStorage.removeItem(LOGIN_ATTEMPTS);
    } catch {
    }
}


export const api = {
    get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
        apiFetch<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        apiFetch<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        apiFetch<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        apiFetch<T>(path, { ...options, method: "PATCH", body }),
    delete: <T = void>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
        apiFetch<T>(path, { ...options, method: "DELETE" })
};


/** Every id in a path is encoded, so a hostile value can't walk to another endpoint */
const seg = (value: string | number) => encodeURIComponent(String(value));

export const paths = {
    me: "/auth/me",
    status: "/status",
    statusHistory: (days = 90) => `/status/history?days=${seg(days)}`,
    logout: "/auth/logout",
    guilds: "/dashboard/guilds",
    lookup: (platform: string, query: string) =>
        `/dashboard/lookup?platform=${encodeURIComponent(platform)}&query=${encodeURIComponent(query)}`,
    guild: (guildId: string) => `/dashboard/guilds/${seg(guildId)}`,
    resources: (guildId: string) => `/dashboard/guilds/${seg(guildId)}/resources`,
    deliveries: (guildId: string, limit = 25) => `/dashboard/guilds/${seg(guildId)}/deliveries?limit=${seg(limit)}`,
    activity: (guildId: string, days = 30) => `/dashboard/guilds/${seg(guildId)}/activity?days=${seg(days)}`,
    live: (guildId: string) => `/dashboard/guilds/${seg(guildId)}/live`,
    user: (guildId: string, userId: string) => `/dashboard/guilds/${seg(guildId)}/users/${seg(userId)}`,
    creators: (guildId: string) => `/dashboard/guilds/${seg(guildId)}/creators`,
    creator: (guildId: string, id: number) => `/dashboard/guilds/${seg(guildId)}/creators/${seg(id)}`,
    creatorReset: (guildId: string, id: number) => `/dashboard/guilds/${seg(guildId)}/creators/${seg(id)}/reset`,
    creatorTest: (guildId: string, id: number) => `/dashboard/guilds/${seg(guildId)}/creators/${seg(id)}/test`,
    test: (guildId: string, requestId: string) => `/dashboard/guilds/${seg(guildId)}/tests/${seg(requestId)}`,
    counters: (guildId: string) => `/dashboard/guilds/${seg(guildId)}/counters`,
    counter: (guildId: string, id: number) => `/dashboard/guilds/${seg(guildId)}/counters/${seg(id)}`,
    botProfile: (guildId: string) => `/dashboard/guilds/${seg(guildId)}/bot-profile`,
    botProfileImage: (guildId: string, image: "avatar" | "banner") => `/api/v1/dashboard/guilds/${seg(guildId)}/bot-profile/${image}`,
    premium: "/dashboard/premium",
    premiumClaim: "/dashboard/premium/claim",
    guildPremium: (guildId: string) => `/dashboard/guilds/${seg(guildId)}/premium`,
    premiumAssignment: (guildId: string) => `/dashboard/premium/assignments/${seg(guildId)}`
};

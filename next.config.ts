import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const apiUrl = (process.env.API_URL ?? "http://localhost:5050").replace(/\/+$/, "");
const production = process.env.NODE_ENV === "production";

/** The CSP carries a per-request nonce, so it is set in middleware.ts */
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ...(production ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : [])
];

const nextConfig: NextConfig = {
    // NEXT_DIST_DIR=.next-prod lets a production build sit next to a running dev server
    distDir: process.env.NEXT_DIST_DIR || ".next",
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
        // A narrow allowlist and one quality, so the optimizer can't be abused to fill the cache
        remotePatterns: [
            { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/icons/**" }
        ],
        qualities: [75]
    },
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
    async rewrites() {
        // The same-origin proxy keeps the session cookie first-party and gives writes this Origin for the CSRF check
        return [
            { source: "/api/v1/auth/:path*", destination: `${apiUrl}/v1/auth/:path*` },
            { source: "/api/v1/dashboard/:path*", destination: `${apiUrl}/v1/dashboard/:path*` },
            { source: "/api/v1/status", destination: `${apiUrl}/v1/status` },
            { source: "/api/v1/status/:path*", destination: `${apiUrl}/v1/status/:path*` }
        ];
    }
};

export default createMDX()(nextConfig);

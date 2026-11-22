import "./globals.css";

import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, pageMetadata } from "@/lib/metadata";
import { Fira_Sans, Outfit } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { getBaseUrl } from "@/lib/urls";


const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const fira = Fira_Sans({ subsets: ["latin"], weight: "900", variable: "--font-fira", display: "swap" });
const fonts = `${outfit.variable} ${fira.variable}`;


export const viewport: Viewport = {
    themeColor: "#17161C",
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1
};


export const metadata: Metadata = {
    metadataBase: new URL(getBaseUrl()),
    ...pageMetadata({ description: SITE_DESCRIPTION, path: "/" }),
    // Each page sets its own canonical, otherwise every page would point at the home page
    alternates: null,
    title: { default: SITE_TITLE, template: "%s · Oreo" },
    applicationName: SITE_NAME,
    manifest: "/manifest.json",
    icons: {
        icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/Icon.svg", type: "image/svg+xml" }],
        apple: { url: "/oreo.png", sizes: "1024x1024" }
    },
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
    keywords: [
        "discord bot", "discord notifications", "youtube notifier", "twitch notifier", "kick notifier",
        "oreo", "oreo bot", "stream alerts", "go live notifications", "discord stream bot",
        "free discord bot", "customizable notifications"
    ],
    creator: "Aniket",
    publisher: "Aniket",
    robots: { index: true, follow: true }
};


// Rendered per request so every script carries that request's CSP nonce
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={fonts} suppressHydrationWarning>
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    );
}

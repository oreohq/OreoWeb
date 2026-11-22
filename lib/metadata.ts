import type { Metadata } from "next";

export const SITE_NAME = "Oreo";
export const SITE_TITLE = "Oreo Discord Bot";
export const SITE_DESCRIPTION =
    "Oreo pings your Discord community the moment you or your favourite creator posts or goes live on YouTube, Twitch and Kick. Free, fully customizable, live in under a minute.";

/** A child's openGraph replaces the parent's whole, so every page sets all of it */
export function pageMetadata({ title, description, path }: { title?: string, description: string, path: string }): Metadata {
    const shown = title ? `${title} · ${SITE_NAME}` : SITE_TITLE;
    const images = [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE }];
    return {
        ...(title ? { title } : {}),
        description,
        alternates: { canonical: path },
        openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: shown, description, url: path, images },
        twitter: { card: "summary_large_image", title: shown, description, images }
    };
}

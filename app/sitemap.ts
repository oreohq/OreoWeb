import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";
import { source } from "@/lib/source";


export default function sitemap(): MetadataRoute.Sitemap {
    const base = getBaseUrl();
    const pages = [
        { path: "/", priority: 1 },
        { path: "/status", priority: 0.5 },
        { path: "/terms", priority: 0.3 },
        { path: "/privacy", priority: 0.3 }
    ];
    return [
        ...pages.map(({ path, priority }) => ({ url: `${base}${path}`, priority })),
        ...source.getPages().map((page) => ({ url: `${base}${page.url}`, priority: page.url === "/guide" ? 0.8 : 0.6 }))
    ];
}

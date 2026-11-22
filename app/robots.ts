import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";


export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] },
        sitemap: `${getBaseUrl()}/sitemap.xml`,
        host: getBaseUrl()
    };
}

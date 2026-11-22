import { SITE_DESCRIPTION, SITE_TITLE, pageMetadata } from "@/lib/metadata";
import { Communities, GuildInfo } from "@/components/home/communities";
import { LoginNotice } from "@/components/site/login-notice";
import { HowItWorks } from "@/components/home/how-it-works";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Faq } from "@/components/home/faq";
import { Cta } from "@/components/home/cta";
import { getBaseUrl } from "@/lib/urls";
import type { Metadata } from "next";
import { Suspense } from "react";


export const metadata: Metadata = pageMetadata({ description: SITE_DESCRIPTION, path: "/" });

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_TITLE,
    alternateName: "Oreo",
    description: SITE_DESCRIPTION,
    url: getBaseUrl(),
    image: `${getBaseUrl()}/oreo.png`,
    applicationCategory: "CommunicationApplication",
    operatingSystem: "Discord",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Aniket" }
};


interface GuildsResponse {
    guildCount?: string;
    memberCount?: string;
    guilds?: GuildInfo[];
}

interface Showcase {
    guildCount: number;
    memberCount: number;
    guilds: Array<{ id: string, name: string, iconUrl: string | null, memberCount: number }>;
}

async function getGuilds(): Promise<GuildsResponse> {
    const api = process.env.API_URL?.replace(/\/+$/, "");
    if (!api) return {};

    try {
        const response = await fetch(`${api}/v1/status/showcase`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(3000) });
        if (!response.ok) return {};
        const body = (await response.json()) as { success?: boolean, data?: Showcase | null };
        const data = body.data;
        if (!body.success || !data?.guildCount) return {};
        return {
            guildCount: `${data.guildCount.toLocaleString("en")}+`,
            memberCount: data.memberCount.toLocaleString("en-IN"),
            guilds: data.guilds
                .filter((guild) => guild.iconUrl?.startsWith("https://cdn.discordapp.com/"))
                .map((guild) => ({ name: guild.name, icon: guild.iconUrl!, partnered: false, verified: false }))
        };
    } catch {
        return {};
    }
}


export default async function HomePage() {
    const guilds = await getGuilds();

    return (
        <>
            {/* Escape "<" so the JSON can't close the script tag */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <Suspense fallback={null}>
                <LoginNotice />
            </Suspense>
            <Hero />
            <Communities
                guilds={guilds.guilds}
                guildCount={guilds.guildCount}
                memberCount={guilds.memberCount}
            />
            <HowItWorks />
            <Features />
            <Faq />
            <Cta />
        </>
    );
}

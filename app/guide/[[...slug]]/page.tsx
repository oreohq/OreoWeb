import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { PremiumOff, PremiumOnly } from "@/components/site/premium-only";
import { Mention, Timestamp } from "@/components/markdown/discord";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Callout } from "fumadocs-ui/components/callout";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { SITE_DESCRIPTION, pageMetadata } from "@/lib/metadata";
import { premiumEnabled } from "@/lib/premium";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import type { Metadata } from "next";


interface Props {
    params: Promise<{ slug?: string[] }>;
}

export default async function GuidePage({ params }: Props) {
    const { slug } = await params;
    const page = source.getPage(slug);
    if (!page) notFound();
    const Body = page.data.body;

    return (
        <DocsPage toc={premiumEnabled ? page.data.toc : page.data.toc.filter((item) => item.url !== "#premium")} full={page.data.full} tableOfContent={{ style: "clerk" }} tableOfContentPopover={{ style: "clerk" }}>
            <DocsTitle className="font-display font-normal tracking-tight text-fd-foreground">{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <DocsBody>
                <Body
                    components={{
                        ...defaultMdxComponents,
                        img: (props: React.ComponentProps<"img">) => <ImageZoom {...(props as React.ComponentProps<typeof ImageZoom>)} />,
                        Callout,
                        Card,
                        Cards,
                        Mention,
                        PremiumOff,
                        PremiumOnly,
                        Timestamp
                    }}
                />
            </DocsBody>
        </DocsPage>
    );
}

export function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const page = source.getPage(slug);
    if (!page) notFound();
    return pageMetadata({ title: page.data.title, description: page.data.description ?? SITE_DESCRIPTION, path: page.url });
}

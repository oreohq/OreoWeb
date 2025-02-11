import { getBaseUrl, getCanonicalUrl } from "@/utils/urls";
import BeautifyMarkdown from "@/components/markdown";
import { readFile } from "fs/promises";
import type { Metadata } from "next";


export const generateMetadata = (): Metadata => {
    const title = "Oreo — Terms of Service";
    const description = "Read about Oreo's Terms of Service.";
    const url = getCanonicalUrl("terms");
    return {
        title: title,
        description: description,
        alternates: {
            canonical: url
        },
        openGraph: {
            url: url,
            title: title,
            type: "website",
            description: description,
            images: `${getBaseUrl()}/assets/oreoSmile.png`
        },
        twitter: {
            title: title,
            site: "oreos.fun",
            card: "summary_large_image",
            description: description,
            images: `${getBaseUrl()}/assets/terms.png`
        }
    }
}


const PATH = `${process.cwd()}/public/legal/terms.md` as const;
export default async function Home() {
    const markdown = await readFile(PATH,  { encoding: "utf-8" });
    return (
        <div className="mb-28">
            <BeautifyMarkdown markdown={markdown} />
        </div>
    )
}
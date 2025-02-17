import { getBaseUrl, getCanonicalUrl } from "@/utils/urls";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

interface Props {
    children: React.ReactNode;
}


export const generateMetadata = async (): Promise<Metadata> => {
    const title = "Oreo Discord Bot — Status";
    const description = "Get notified on your Discord Community whenever you or your favourite creator posts or goes live on Youtube, Rooter & Twitch within no time.";
    const url = getCanonicalUrl("status");

    return {
        title: title,
        description: description,
        alternates: { canonical: url },
        openGraph: { title, description: description, url, type: "website", images: `${getBaseUrl()}/assets/status.png` },
        twitter: { card: "summary_large_image", title, description: description, images: `${getBaseUrl()}/assets/status.png` }
    }
}


export default async function RootLayout({ children }: Props) {
    return (
        <div className="w-full">
            <div className="mb-20">{children}</div>
            <Footer />
        </div>
    )
}
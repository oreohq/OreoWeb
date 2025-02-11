import { Direction, EditPreview, UserAdd, Fire, At, Brackets, Folder, ExternalLink } from "@/components/icons";
import { getBaseUrl, getCanonicalUrl } from "@/utils/urls";
import { Button, Divider } from "@nextui-org/react";
import { Footer } from "@/components/footer";
import { Metadata } from "next";
import oreoImage from "@/public/assets/oreo.png";
import GuideMeta from "@/public/guide/meta.json";
import Image from "next/image";
import Link from "next/link";
import cn from "@/utils/cn";


interface Props { 
    params: Promise<{ pathname: string[] }>;
    children: React.ReactNode;
};


export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { pathname } = await params;
    const meta = GuideMeta.pages.find(page => page.file === `${pathname.join("/").toLowerCase()}.md`);
    const description = "Get notified on your Discord Community whenever you or your favourite creator posts or goes live on Youtube, Rooter & Twitch within no time.";
    const title = `Oreo Guide — ${meta?.name || ""}`;
    const url = getCanonicalUrl("guide", ...pathname);

    return {
        title: title,
        description: description,
        alternates: { canonical: url },
        openGraph: { title, description: description, url, type: "website", images: `${getBaseUrl()}/assets/guide.png` },
        twitter: { card: "summary_large_image", title, description: description, images: `${getBaseUrl()}/assets/guide.png` }
    }
}



export default async function RootLayout({ params, children }: Props) {
    const { pathname } = await params;
    const meta = GuideMeta.pages.find(page => page.file === `${pathname.join("/").toLowerCase()}.md`);
    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row gap-3 mb-28">
                <nav className="w-full lg:w-1/4">
                    <ul className="bg-dark-800 text-neutral-100 rounded-lg shadow-md p-4 space-y-2">
                        <li>
                            <div className="flex items-center justify-start py-2 gap-2">
                                <Image src={oreoImage} width={30} height={30} alt="" className="rounded-lg w-8 h-8 shrink-0"  />
                                <h1 className="text-xl font-medium text-neutral-100">Oreo Guide</h1>
                            </div>
                        </li>
                        {GuideMeta.pages.map((page, i) => (
                            <NavButton
                                key={"nav-" + page.file + i}
                                isActive={page.file === meta?.file}
                                page={page}
                            />
                        ))}
                        <li>
                            <Divider className="bg-dark-600 shadow-md w-auto rounded-full h-0.5 mx-2 my-3" />
                        </li>
                        <li>
                            <Button as={Link} className="w-full shadow-md bg-dark-600 hover:bg-dark-700" href="/support" target="_blank" endContent={<ExternalLink />}>
                                Support Server
                            </Button>
                        </li>
                    </ul>
                </nav>
                {children}

            </div>
            <Footer />
        </div>
    )
}


function NavButton({ page, isActive }: { page: typeof GuideMeta.pages[0]; isActive: boolean; }) {
    const file = page.file.replace(/\.md$/, "");
    return (
        <li>
            <Button
                as={Link} size="md"
                href={`/guide/${file}`}
                startContent={<NavButtonIcon file={file} />}
                className={cn("w-full shadow-md !justify-start", isActive ? "button-primary" : "button-secondary")}
            >
                {page.name}
            </Button>
        </li>
    );
}


function NavButtonIcon({ file }: { file: string; }) {
    switch (file) {
        case "add": return (<UserAdd className="size-5" />);
        case "customize": return (<EditPreview className="size-5" />);
        case "placeholders": return (<Brackets className="size-5" />);
        case "pingrole": return (<At className="size-5" />);
        case "embeds": return (<Fire className="size-5" />);
        case "testnotifications": return (<Direction className="size-5" />);
        default: return (<Folder className="size-5" />);
    }
}
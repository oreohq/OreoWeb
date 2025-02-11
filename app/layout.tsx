import "./globals.css";
import "animate.css/animate.min.css";

import { Metadata, Viewport } from "next";
import { Button, Divider } from "@nextui-org/react";
import { Lilita_One, Outfit } from "next/font/google";
import { Discord, ExclamationCircle } from "@/components/icons";
import { getBaseUrl } from "@/utils/urls";
import { Provider } from "./provider";
import Link from "next/link";
import cn from "@/utils/cn";


const outfit = Outfit({ subsets: ["latin"] });
const lilita = Lilita_One({ subsets: ["latin"], weight: "400" });


export const viewport: Viewport = {
    themeColor: "#FFA277",
    initialScale: 0.85
};


export const generateMetadata = async (): Promise<Metadata> => {
    const title = "Oreo Discord Bot";
    const description = "Hi, I'm Oreo! A discord bot that notifies on your Discord Community whenever you or your favourite creator posts or goes live, within no time.";
    return {
        metadataBase: new URL(getBaseUrl()),
        manifest: "/manifest.json",
        appleWebApp: {
            capable: true,
            title: "Oreo",
            startupImage: "/assets/oreoSmile.png",
            statusBarStyle: "black-translucent"
        },
        title: {
            default: title,
            template: "%s"
        },
        description: description,
        keywords: [
            "discord", "bot", "app", "discord bot", "discord app", "discord application", "oreo", "oreo bot", "oreos.fun", "oreo notifier", "oreo notifications", "oreo rooter", "oreo youtube", "oreo twitch",
            "rooter notifier", "twitch notifier", "youtube notifier", "topgg", "rooter", "discord notifications", "oreo notifs", "rooter notifs", "twitch notifs", "youtube notifs", "free", "customizable",
            "twitch", "youtube", "notifications"
        ],
        alternates: {
            canonical: getBaseUrl()
        },
        openGraph: {
            title: {
                default: title,
                template: "%s on Oreo"
            },
            description: description,
            type: "website",
            url: getBaseUrl(),
            images: `${getBaseUrl()}/assets/oreoSmile.png`
        },
        twitter: {
            card: "summary",
            site: "oreos.fun",
            title: title,
            description: description,
            images: `${getBaseUrl()}/assets/oreoSmile.png`
        },
        other: {
            google: "notranslate"
        },
        creator: "Aniket",
        publisher: "Aniket",
        robots: "index, follow"
    }
}



export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning data-theme="dark" lang="en" className="flex justify-center min-h-screen max-w-screen overflow-x-hidden" >
            <body className={cn("w-full max-w-7xl overflow-x-hidden xl:!overflow-visible", outfit.className)} style={{ overflow: "visible" }} >
            <div id="bg" className="absolute top-0 right-0 w-screen h-screen -z-10" />

                <NoScript />
                <NavBar />
                <Provider>
                    {children}
                </Provider>
            </body>
        </html>
    );
}


function NoScript() {
    return (
        <noscript className="p-4 pb-0 flex">
            <div className="w-full flex flex-row items-center text-neutral-100 bg-oreo-700/40 rounded-md py-2 px-4 mb-0 gap-2">
                <div className="flex items-center gap-2">
                    <ExclamationCircle className="size-4" />
                    <div className="text-medium">
                        This site needs JavaScript to work - Please either enable JavaScript or update to a supported Browser.
                    </div>
                </div>
            </div>
        </noscript>
    );
}


function NavBar() {
    return (
        <nav className="px-4 py-5 flex items-center gap-2 text-base font-medium text-neutral-300 select-none h-20 w-full">
            
            <Link href="/" className={cn("font-semibold flex items-center mr-2", lilita.className)} >
                <span className="text-3xl text-oreo-600">OREO</span>
            </Link>

            <Divider
                className="h-10 rotate-6 mx-1 bg-dark-600"
                orientation="vertical"
            />

            <div className="flex gap-3">
                <Link href="/guide/add" className="py-1 px-3 rounded-md" >
                    <span className="text-lg hover:text-white">Guide</span>
                </Link>
                <Link href="/status" className="py-1 px-3 rounded-md hidden sm:flex" >
                    <span className="text-lg hover:text-white">Status</span>
                </Link>
                <Link href="/vote" className="py-1 px-3 rounded-md hidden sm:flex" >
                    <span className="text-lg hover:text-white">Vote</span>
                </Link>
            </div>

            <div className="ml-auto">
                <Button 
                    as={Link}
                    href="/support"
                    prefetch={false}
                    startContent={<Discord />}
                    className="button-secondary"
                >
                    <span>Support Server</span>
                </Button>
            </div>
        </nav>
    );
}
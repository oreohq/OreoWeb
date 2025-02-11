import AniketAvatar from "@/public/assets/aniket.png";
import { Lilita_One } from "next/font/google";
import { Heart } from "@/components/icons";
import { HTMLProps } from "react";
import Image from "next/image";
import Link from "next/link";
import cn from "@/utils/cn";


const lilita = Lilita_One({ subsets: ["latin"], weight: "400" });
export function Footer(props: HTMLProps<HTMLDivElement>) {
    return (
        <div className="relative bottom-0">
            <div className="bg-dark-950 absolute w-screen h-full z-[-10]" style={{ width: "100vw", left: "calc(50% - 50vw)" }}></div>
            <div className={cn("w-full flex flex-col lg:flex-row items-center gap-8 md:justify-between pt-20 pb-16", props.className)} {...props} >
    
                <div className="gap-y-1">
                    <span className={cn("text-3xl font-semibold text-white", lilita.className)}>OREO</span>
                    <span className="flex items-center">
                        Get notified on your Discord Community whenever you or your favourite creator posts or goes live.

                    </span>

                    <span className="flex items-center gap-1 text-white">
                        <Heart className="size-4 text-red-500" />Made By 
                        <Link className="ml-1.5 flex items-center gap-1" href="https://github.com/aniket091" target="_blank">
                            <Image src={AniketAvatar} alt="avatar" width={18} height={18} className="rounded-full"/>
                            Aniket
                        </Link>
                    </span>
                </div>
                <FooterQuickLinks />
            </div>
        </div>
    )
}


function FooterQuickLinks() {
    return (
        <div className="flex flex-row gap-10 select-none w-full justify-between md:justify-end">
            <div>
                <div className="font-medium text-neutral-300 mb-1">Oreo</div>
                <Link className="flex items-center gap-2" href="/invite">Add Bot</Link>
                <Link className="flex items-center gap-2" href="/topgg">Top.gg</Link>
                <Link className="flex items-center gap-2" href="/vote">Vote</Link>
            </div>
            <div>
                <div className="font-medium text-neutral-300 mb-1">Resources</div>
                <Link className="flex items-center gap-2" href="/support">Support</Link>
                <Link className="flex items-center gap-2" href="/guide/add">Guide</Link>
                <Link className="flex items-center gap-2" href="/status">Status</Link>
            </div>
            <div>
                <div className="font-medium text-neutral-300 mb-1">Legal</div>
                <Link className="flex items-center gap-1.5" href="/terms"><span>Terms of Service</span></Link>
                <Link className="flex items-center gap-2" href="/privacy"><span>Privacy Policy</span></Link>
            </div>
        </div>
    )
}

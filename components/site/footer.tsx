import { FooterPeek } from "@/components/site/footer-peek";
import { EasterEgg } from "@/components/site/easter-egg";
import { DiscordIcon } from "@/components/ui/icons";
import { CreamSeam } from "@/components/ui/cookie";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import Link from "next/link";


const groups = [
    {
        title: "Oreo",
        links: [
            { label: "Add to Discord", href: "/invite" },
            { label: "Top.gg", href: "/topgg" },
            { label: "Vote", href: "/vote" }
        ]
    },
    {
        title: "Resources",
        links: [
            { label: "Guide", href: "/guide" },
            { label: "Status", href: "/status" },
            { label: "Support", href: "/support" },
            { label: "Donate", href: "/kofi" }
        ]
    },
    {
        title: "Legal",
        links: [
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" }
        ]
    }
];


export function Footer() {
    return (
        <footer className="relative mt-32 overflow-x-clip bg-cocoa-950">
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_2px_0_rgb(0_0_0/0.4)]" aria-hidden="true" />
            <FooterPeek />

            <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 pt-16 sm:px-8">
                <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
                    <div className="max-w-sm">
                        <div className="flex select-none items-center gap-2.5">
                            <EasterEgg />
                            <Link href="/" className="font-display text-3xl leading-none tracking-wide text-cream-500">
                                OREO
                            </Link>
                        </div>

                        <p className="mt-4 text-cream-100/55">
                            Discord notifications the moment your creators go live or upload on YouTube,
                            Twitch or Kick.
                        </p>

                        <Button href="/support" external variant="keyCocoa" size="sm" className="mt-5">
                            <DiscordIcon className="size-4" />
                            Join the support server
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-14">
                        {groups.map((group) => (
                            <div key={group.title}>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cream-100/85">
                                    {group.title}
                                </h3>
                                <ul className="space-y-2">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                prefetch={false}
                                                className="text-cream-100/55 transition-colors hover:text-cream-400"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <CreamSeam className="my-10 opacity-60" />

                <div className="flex flex-col items-center justify-between gap-4 text-sm text-cream-100/45 sm:flex-row">
                    <span>© {new Date().getFullYear()} Oreo. All rights reserved.</span>
                    <span className="flex items-center gap-1.5">
                        Made with <Heart className="size-4 fill-red-500 text-red-500" /> by
                        <Link
                            href="https://github.com/aniket091"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 font-medium text-cream-100/75 transition-colors hover:text-cream-400"
                        >
                            <Avatar src="https://github.com/aniket091.png?size=48" name="Aniket" className="size-5 bg-cocoa-700 text-[0.6rem]" />
                            Aniket
                        </Link>
                    </span>
                </div>
            </div>
        </footer>
    );
}

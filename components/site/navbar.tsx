"use client";

import { AddIcon, DiscordIcon } from "@/components/ui/icons";
import { ScrollLink } from "@/components/ui/scroll-link";
import { CookieMark } from "@/components/ui/cookie";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import cn from "@/lib/cn";


const nav = [
    { label: "Features", scrollTo: "features" },
    { label: "Guide", href: "/guide" },
    { label: "Status", href: "/status" },
    { label: "Vote", href: "/vote" },
    // Never prefetched, because without a session the dashboard redirects into the Discord login
    { label: "Dashboard", href: "/dashboard", prefetch: false }
] as const;


export function NavBar({ bar = false }: { bar?: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const pill = scrolled && !bar;
    const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <header className={cn("fixed inset-x-0 top-0 z-50 flex justify-center transition-[padding] duration-500 ease-out", pill ? "px-3 pt-3 sm:px-5 sm:pt-4" : "px-0 pt-0")}>
            <nav
                className={cn(
                    "flex w-full items-center gap-2 border backdrop-blur-xl transition-all duration-500 ease-out",
                    pill
                        ? "max-w-6xl rounded-2xl border-cream-200/10 bg-cocoa-900/80 px-3 py-2.5 shadow-lg shadow-black/40 sm:px-4"
                        : "max-w-full rounded-none border-x-transparent border-t-transparent border-b-cream-200/[0.06] bg-cocoa-850/80 py-3 px-5 lg:px-[8.25rem]"
                )}
            >
                <Link href="/" className="group flex select-none items-center gap-2.5" aria-label="Oreo home">
                    <CookieMark className="size-8 transition-transform duration-500 group-hover:rotate-[24deg]" />
                    <span className="font-display text-2xl leading-none tracking-wide text-cream-500">OREO</span>
                </Link>

                <ul className="ml-4 hidden items-center gap-1 lg:flex">
                    {nav.map((item) => {
                        const current = "href" in item && isCurrent(item.href);
                        const classes = cn(
                            "block cursor-pointer rounded-xl px-3 py-2 text-[0.95rem] font-medium transition-colors hover:bg-cream-100/6 hover:text-cream-100",
                            current ? "bg-cream-100/6 text-cream-100" : "text-cream-100/60"
                        );
                        return (
                            <li key={item.label}>
                                {"scrollTo" in item ? (
                                    <ScrollLink to={item.scrollTo} className={classes}>{item.label}</ScrollLink>
                                ) : (
                                    <Link
                                        href={item.href}
                                        prefetch={"prefetch" in item ? item.prefetch : undefined}
                                        aria-current={current ? "page" : undefined}
                                        className={classes}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <div className="ml-auto flex items-center gap-2">
                    <Button href="/support" external variant="ghost" size="sm" className="hidden sm:inline-flex">
                        <DiscordIcon className="size-4" />
                        Support
                    </Button>
                    <Button href="/invite" external size="sm" className="hidden sm:inline-flex">
                        <AddIcon className="size-4" />
                        Add to Discord
                    </Button>

                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        className="grid size-10 place-items-center rounded-xl border border-cream-200/10 bg-cocoa-800/70 text-cream-100 lg:hidden"
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </nav>

            {open && (
                <div className="fixed inset-x-3 top-20 z-50 rounded-3xl border border-cream-200/10 bg-cocoa-900/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl lg:hidden">
                    <ul className="flex flex-col">
                        {nav.map((item) => {
                            const current = "href" in item && isCurrent(item.href);
                            const classes = cn(
                                "block cursor-pointer rounded-2xl px-4 py-3 text-lg font-medium transition-colors hover:bg-cream-100/6 hover:text-cream-100",
                                current ? "bg-cream-100/6 text-cream-100" : "text-cream-100/75"
                            );
                            return (
                                <li key={item.label}>
                                    {"scrollTo" in item ? (
                                        <ScrollLink to={item.scrollTo} className={classes} onNavigate={() => setOpen(false)}>
                                            {item.label}
                                        </ScrollLink>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            prefetch={"prefetch" in item ? item.prefetch : undefined}
                                            onClick={() => setOpen(false)}
                                            aria-current={current ? "page" : undefined}
                                            className={classes}
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-2 grid gap-2 border-t border-cocoa-700 pt-3">
                        <Button href="/support" external variant="cocoa" size="md" className="w-full">
                            <DiscordIcon className="size-4" />
                            Support Server
                        </Button>
                        <Button href="/invite" external size="md" className="w-full">
                            <AddIcon className="size-4" />
                            Add to Discord
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}

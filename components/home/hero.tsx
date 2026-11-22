"use client";

import { Button } from "@/components/ui/button";
import { AddIcon } from "@/components/ui/icons";
import { ArrowDown } from "lucide-react";
import { smoothScrollTo } from "@/lib/scroll";


export function Hero() {
    // Fills the screen minus a strip, so the servers marquee below peeks in
    return (
        <section className="relative isolate flex min-h-[calc(100svh-14rem)] flex-col justify-center overflow-hidden px-5 pb-16 pt-32 sm:px-8">
            <Backdrop />

            <div className="relative mx-auto w-full max-w-5xl text-center">
                <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-[-0.025em] text-cream-100 sm:text-7xl lg:text-[5.25rem]">
                    Keep your Discord
                    <br />
                    community <span className="whitespace-nowrap">in the loop.</span>
                </h1>

                <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-cream-100/60 sm:text-xl">
                    Oreo posts a Discord notification the moment someone streams or uploads on{" "}
                    <PlatformWord name="YouTube" color="#FF0033" />,{" "}
                    <PlatformWord name="Twitch" color="#9146FF" /> or{" "}
                    <PlatformWord name="Kick" color="#53FC18" />.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
                    <Button href="/invite" external variant="key" size="lg" className="w-full sm:w-auto">
                        <AddIcon className="size-5" />
                        Add to Discord
                    </Button>
                    <Button variant="keyCocoa" size="lg" className="group w-full sm:w-auto" onClick={() => smoothScrollTo("how-it-works")}>
                        See how it works
                        <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}


function PlatformWord({ name, color }: { name: string, color: string }) {
    return (
        <span className="font-semibold" style={{ color }}>
            {name}
        </span>
    );
}


function Backdrop() {
    return (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div
                className="absolute left-1/2 top-[52%] size-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[140px]"
                style={{ background: "radial-gradient(circle, #FFA27730 0%, #FFA27712 45%, transparent 70%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-cocoa-950" />
        </div>
    );
}

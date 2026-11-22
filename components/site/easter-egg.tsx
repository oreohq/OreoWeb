"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CookieMark } from "@/components/ui/cookie";
import { Sparkles } from "lucide-react";
import cn from "@/lib/cn";


const CLICKS_TO_UNLOCK = 5;
const CRUMB_COUNT = 14;

const FACTS = [
    "Oreo's first notification went out on 20 Sept 2022.",
    "The fastest go-live ping on record: 1.8 seconds.",
    "Oreo has never once polled an API on a timer. Webhooks only.",
    "The cream filling is 100% vector. No cookies were harmed.",
    "You are the reason the twist-lick-dunk method exists."
];


export function EasterEgg() {
    const [clicks, setClicks] = useState(0);
    const [opened, setOpened] = useState(false);
    const [fact, setFact] = useState(FACTS[0]!);
    const [reduced, setReduced] = useState(false);
    const timer = useRef<number | null>(null);
    // A ref, not state, because five quick clicks would otherwise land in one React batch
    const count = useRef(0);

    useEffect(() => {
        setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        return () => {
            if (timer.current) window.clearTimeout(timer.current);
        };
    }, []);

    const randomFact = () => FACTS[Math.floor(Math.random() * FACTS.length)]!;

    const handleClick = useCallback(() => {
        if (opened) {
            setFact(randomFact());
            return;
        }

        count.current += 1;
        setClicks(count.current);

        if (count.current >= CLICKS_TO_UNLOCK) {
            if (timer.current) window.clearTimeout(timer.current);
            setFact(randomFact());
            setOpened(true);
            return;
        }

        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            count.current = 0;
            setClicks(0);
        }, 2500);
    }, [opened]);

    const nearly = clicks >= 2 && !opened;

    return (
        <div className="relative inline-flex flex-col items-start">
            <button
                type="button"
                onClick={handleClick}
                aria-label={opened ? "Another Oreo fact" : "Twist the cookie"}
                title={opened ? "Twist again" : undefined}
                className="group relative grid size-11 place-items-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
                style={{ transform: `rotate(${clicks * 24}deg)` }}
            >
                <CookieMark className={cn("size-9 transition-opacity", opened && "opacity-90")} />

                {nearly && (
                    <span className="pointer-events-none absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-cream-500 text-[0.6rem] font-bold text-cocoa-950">
                        {CLICKS_TO_UNLOCK - clicks}
                    </span>
                )}

                {opened && !reduced && (
                    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
                        {Array.from({ length: CRUMB_COUNT }).map((_, i) => {
                            const angle = (360 / CRUMB_COUNT) * i;
                            return (
                                <span
                                    key={i}
                                    className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-cream-400"
                                    style={{
                                        animation: `crumb 900ms cubic-bezier(0.16,1,0.3,1) ${i * 18}ms both`,
                                        ["--angle" as string]: `${angle}deg`
                                    }}
                                />
                            );
                        })}
                    </span>
                )}
            </button>

            {opened && (
                <div
                    role="status"
                    className="animate-rise absolute left-0 top-full z-20 mt-3 w-64 rounded-2xl border border-cream-300/20 bg-cocoa-800/95 px-4 py-3 shadow-xl shadow-black/50 backdrop-blur-sm"
                >
                    <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cream-400">
                        <Sparkles className="size-3" />
                        You found the filling
                    </p>
                    <p className="mt-1.5 text-sm text-cream-100/70">{fact}</p>
                    <p className="mt-2 text-[0.68rem] text-cream-100/35">Twist again for another.</p>
                </div>
            )}
        </div>
    );
}

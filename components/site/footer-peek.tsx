"use client";

import { useEffect, useRef, useState } from "react";
import { CookieMark } from "@/components/ui/cookie";


const LINES = [
    "Shh… I'm hiding from the milk.",
    "Five more minutes, I'm on break.",
    "Psst: twist my twin down there five times.",
    "I only come out for go-lives.",
    "Don't tell the dashboard you saw me.",
    "Crumbs? What crumbs?",
    "Been watching streams all day. For research.",
    "Dunk responsibly."
];


export function FooterPeek() {
    const [line, setLine] = useState<number | null>(null);
    // Picked after mount so the server and client markup match
    const [spot, setSpot] = useState<number | null>(null);
    const timer = useRef<number | null>(null);

    useEffect(() => {
        if (Math.random() < 0.4) setSpot(15 + Math.random() * 70);
        return () => {
            if (timer.current) window.clearTimeout(timer.current);
        };
    }, []);

    const peek = () => {
        setLine((current) => {
            if (current === null) return Math.floor(Math.random() * LINES.length);
            const next = Math.floor(Math.random() * (LINES.length - 1));
            return next < current ? next : next + 1;
        });
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setLine(null), 2600);
    };

    const hide = () => {
        if (timer.current) window.clearTimeout(timer.current);
        setLine(null);
    };

    if (spot === null) return null;

    return (
        <div className="absolute bottom-full flex -translate-x-1/2 flex-col items-center" style={{ left: `${spot}%` }}>
            {line !== null && (
                <p key={line} role="status" className="mb-1.5 select-none animate-[pop-in_0.25s_ease-out] whitespace-nowrap rounded-xl bg-cream-200 px-3 py-1 text-xs font-medium text-cocoa-850 shadow-lg">
                    {LINES[line]}
                </p>
            )}
            <button type="button" onClick={peek} onMouseLeave={hide} onBlur={hide} aria-label="A cookie is hiding here" className="group h-10 w-14 overflow-hidden">
                <CookieMark className="mx-auto size-14 translate-y-[62%] transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0" />
            </button>
        </div>
    );
}

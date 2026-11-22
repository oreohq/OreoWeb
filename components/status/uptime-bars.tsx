"use client";

import type { StatusHistory } from "@/lib/api/types";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { useState } from "react";
import cn from "@/lib/cn";


type Day = StatusHistory["components"][number]["days"][number];
type Tone = "none" | "ok" | "warn" | "bad";

function dayTone(day: Day): Tone {
    if (day.uptime === null) return "none";
    if (day.down === 0 && day.degraded === 0) return "ok";
    if (day.down >= 30 || day.uptime < 98) return "bad";
    return "warn";
}

const TONES: Record<Tone, string> = {
    none: "bg-paper/[0.07]",
    ok: "bg-ok/85",
    warn: "bg-warn",
    bad: "bg-bad"
};

function minutes(value: number) {
    if (value < 60) return `${value} min`;
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/** A fixed locale, so the server and browser renders produce the same text */
export function dayLabel(date: string) {
    const parsed = new Date(`${date}T00:00:00Z`);
    return parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}


export function UptimeBars({ days, label }: { days: Day[], label: string }) {
    const [active, setActive] = useState<number | null>(null);
    const focused = active !== null ? days[active] : undefined;
    const hiddenOnPhones = Math.max(0, days.length - 30);

    return (
        <div className="relative" onMouseLeave={() => setActive(null)}>
            <ol className="flex h-9 items-stretch gap-[2px] sm:gap-[3px]" aria-label={`${label}: daily uptime`}>
                {days.map((day, index) => {
                    const tone = dayTone(day);
                    return (
                        <li
                            key={day.date}
                            className={cn("flex min-w-0 flex-1", index < hiddenOnPhones && "max-sm:hidden")}
                            onMouseEnter={() => setActive(index)}
                        >
                            <m.button
                                type="button"
                                className={cn(
                                    "w-full rounded-[2px] outline-none transition-[opacity,filter] duration-150 focus-visible:ring-2 focus-visible:ring-cream-500",
                                    TONES[tone],
                                    active !== null && active !== index && "opacity-60",
                                    active === index && "brightness-125"
                                )}
                                style={{ originY: 1 }}
                                initial={{ scaleY: 0.2, opacity: 0 }}
                                animate={{ scaleY: 1, opacity: 1 }}
                                transition={{ duration: 0.4, ease: EASE_OUT, delay: Math.min(index, 90) * 0.004 }}
                                onFocus={() => setActive(index)}
                                onBlur={() => setActive(null)}
                                aria-label={
                                    day.uptime === null
                                        ? `${dayLabel(day.date)}: no data`
                                        : `${dayLabel(day.date)}: ${day.uptime.toFixed(2)}% uptime${day.down ? `, ${minutes(day.down)} down` : ""}${day.degraded ? `, ${minutes(day.degraded)} degraded` : ""}`
                                }
                            />
                        </li>
                    );
                })}
            </ol>

            <AnimatePresence>
                {focused && active !== null && (
                    <m.div
                        key="tip"
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full z-10 mb-2 w-52 -translate-x-1/2 rounded-lg border border-paper/10 bg-ink-950 p-2.5 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.7)]"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0, left: `${Math.min(Math.max(((active + 0.5) / days.length) * 100, 12), 88)}%` }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.16, ease: EASE_OUT }}
                    >
                        <p className="text-xs font-medium text-paper/70">{dayLabel(focused.date)}</p>
                        {focused.uptime === null ? (
                            <p className="mt-0.5 text-sm text-paper/70">No data for this day</p>
                        ) : (
                            <>
                                <p className="mt-0.5 text-sm font-semibold tabular-nums text-paper">{focused.uptime.toFixed(2)}% uptime</p>
                                {focused.down === 0 && focused.degraded === 0 ? (
                                    <p className="mt-0.5 text-xs text-ok">No incidents</p>
                                ) : (
                                    <ul className="mt-1 space-y-0.5 text-xs">
                                        {focused.down > 0 && <li className="text-[var(--color-bad-300)]">{minutes(focused.down)} down</li>}
                                        {focused.degraded > 0 && <li className="text-warn">{minutes(focused.degraded)} degraded</li>}
                                    </ul>
                                )}
                            </>
                        )}
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}

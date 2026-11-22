"use client";

import { CHART_COLORS, PLATFORM_ORDER, platformName } from "@/lib/dashboard/platforms";
import type { GuildActivity, PlatformName } from "@/lib/api/types";
import { formatNumber } from "@/lib/dashboard/format";
import { AnimatePresence, m } from "motion/react";
import { EASE_OUT, spring } from "@/lib/motion";
import { useMemo, useState } from "react";
import cn from "@/lib/cn";


type Day = GuildActivity["days"][number];

const total = (day: Day) => day.youtube + day.twitch + day.kick;

function niceCeil(value: number) {
    if (value <= 4) return 4;
    const power = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= value) ?? 10;
    return step * power;
}

export function dayLabel(date: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
    const parsed = new Date(`${date}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString(undefined, { ...options, timeZone: "UTC" }) : date;
}


export function ActivityChart({ days, className }: { days: Day[], className?: string }) {
    const [hover, setHover] = useState<number | null>(null);
    const [announce, setAnnounce] = useState(false);
    const top = useMemo(() => niceCeil(Math.max(0, ...days.map(total))), [days]);
    const sum = days.reduce((acc, day) => acc + total(day), 0);
    const focused = hover !== null ? days[hover] : undefined;

    return (
        <div className={cn("relative", className)}>
            <div
                className="relative h-44 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-cream-500 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-850 sm:h-52"
                role="group"
                tabIndex={0}
                aria-label={`${formatNumber(sum)} notifications over the last ${days.length} days. Use the arrow keys to go through the days.`}
                onMouseLeave={() => setHover(null)}
                onMouseMove={() => setAnnounce(false)}
                onFocus={() => {
                    setAnnounce(true);
                    setHover((current) => current ?? days.length - 1);
                }}
                onBlur={() => setHover(null)}
                onKeyDown={(event) => {
                    if (!days.length) return;
                    const last = days.length - 1;
                    const from = hover ?? last;
                    const next =
                        event.key === "ArrowLeft" ? Math.max(0, from - 1)
                        : event.key === "ArrowRight" ? Math.min(last, from + 1)
                        : event.key === "Home" ? 0
                        : event.key === "End" ? last
                        : null;
                    if (next === null) return;
                    event.preventDefault();
                    setAnnounce(true);
                    setHover(next);
                }}
            >
                {[1, 0.5, 0].map((fraction) => (
                    <div
                        key={fraction}
                        className={cn("absolute inset-x-0 border-t", fraction === 0 ? "border-paper/10" : "border-dashed border-paper/[0.06]")}
                        style={{ bottom: `${fraction * 100}%` }}
                        aria-hidden="true"
                    >
                        <span className="absolute -top-2 left-0 bg-ink-850 pr-1.5 text-[0.625rem] tabular-nums text-paper/45">
                            {formatNumber(Math.round(top * fraction))}
                        </span>
                    </div>
                ))}

                <div className="absolute inset-y-0 left-7 right-0 flex items-end gap-[3px] sm:gap-1" aria-hidden="true">
                    {days.map((day, index) => {
                        const value = total(day);
                        return (
                            <div
                                key={day.date}
                                className="relative flex h-full min-w-0 flex-1 items-end"
                                onMouseEnter={() => setHover(index)}
                            >
                                <div
                                    className={cn(
                                        "absolute inset-x-[-1px] inset-y-0 rounded-md transition-colors duration-150",
                                        hover === index ? "bg-paper/[0.04]" : "bg-transparent"
                                    )}
                                />
                                {value > 0 ? (
                                    <m.div
                                        className="relative flex w-full flex-col-reverse overflow-hidden rounded-[3px]"
                                        style={{ height: `${(value / top) * 100}%`, originY: 1 }}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ ...spring.smooth, delay: 0.1 + index * 0.012 }}
                                    >
                                        {PLATFORM_ORDER.map((platform) =>
                                            day[platform] > 0 ? (
                                                <span
                                                    key={platform}
                                                    className={cn("block w-full transition-opacity duration-150", hover !== null && hover !== index && "opacity-50")}
                                                    style={{ height: `${(day[platform] / value) * 100}%`, background: CHART_COLORS[platform] }}
                                                />
                                            ) : null
                                        )}
                                    </m.div>
                                ) : (
                                    <span className="relative block h-[2px] w-full rounded-full bg-paper/10" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {focused && hover !== null && (
                        <m.div
                            key="tip"
                            className="pointer-events-none absolute top-0 z-10 w-44 -translate-x-1/2 rounded-lg border border-paper/10 bg-ink-950 p-2.5 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.7)]"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                left: `calc(1.75rem + (100% - 1.75rem) * ${Math.min(Math.max((hover + 0.5) / days.length, 0.18), 0.82)})`
                            }}
                            exit={{ opacity: 0, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.18, ease: EASE_OUT }}
                        >
                            <p className="text-xs font-medium text-paper/70">{dayLabel(focused.date, { weekday: "short", month: "short", day: "numeric" })}</p>
                            <p className="mt-0.5 text-sm font-semibold tabular-nums text-paper">
                                {formatNumber(total(focused))} {total(focused) === 1 ? "notification" : "notifications"}
                            </p>
                            <ul className="mt-1.5 space-y-0.5">
                                {PLATFORM_ORDER.map((platform) => (
                                    <TipRow key={platform} platform={platform} value={focused[platform]} />
                                ))}
                                {focused.failed > 0 && (
                                    <li className="flex items-center justify-between text-xs text-[var(--color-bad-300)]">
                                        <span>Failed</span>
                                        <span className="tabular-nums">{formatNumber(focused.failed)}</span>
                                    </li>
                                )}
                            </ul>
                        </m.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="sr-only" aria-live="polite">
                {announce && focused
                    ? `${dayLabel(focused.date, { weekday: "long", month: "long", day: "numeric" })}: ${formatNumber(total(focused))} notifications. ` +
                      PLATFORM_ORDER.map((platform) => `${platformName(platform)} ${focused[platform]}`).join(", ") +
                      (focused.failed ? `. ${focused.failed} failed.` : ".")
                    : ""}
            </p>

            {days.length > 0 && (
                <div className="ml-7 mt-2 flex justify-between text-xs text-paper/50" aria-hidden="true">
                    <span>{dayLabel(days[0]!.date)}</span>
                    <span className="hidden sm:inline">{dayLabel(days[Math.floor(days.length / 2)]!.date)}</span>
                    <span>Today</span>
                </div>
            )}
        </div>
    );
}

function TipRow({ platform, value }: { platform: PlatformName, value: number }) {
    return (
        <li className="flex items-center justify-between text-xs text-paper/65">
            <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-[2px]" style={{ background: CHART_COLORS[platform] }} />
                {platformName(platform)}
            </span>
            <span className="tabular-nums">{formatNumber(value)}</span>
        </li>
    );
}

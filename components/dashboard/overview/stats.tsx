"use client";

import { ArrowDownRight, ArrowUpRight, Bell, CircleCheck, Gauge, Users } from "@/components/ui/glyphs";
import { CHART_COLORS, PLATFORM_ORDER, platformColor, platformName } from "@/lib/dashboard/platforms";
import type { GuildActivity, GuildOverview } from "@/lib/api/types";
import { AnimatedNumber } from "@/components/motion/primitives";
import { PlatformIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { planLabel } from "@/lib/premium";
import cn from "@/lib/cn";


const sumDays = (days: GuildActivity["days"]) => days.reduce((acc, day) => acc + day.youtube + day.twitch + day.kick, 0);

export function Kpis({ overview, activity }: { overview: GuildOverview, activity: GuildActivity | undefined | null }) {
    const { stats, limits } = overview;
    const notifications = PLATFORM_ORDER.reduce((acc, platform) => acc + (stats.notifications[platform] ?? 0), 0);

    const thisWeek = activity ? sumDays(activity.days.slice(-7)) : 0;
    const lastWeek = activity ? sumDays(activity.days.slice(-14, -7)) : 0;
    const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

    const finished = activity ? activity.totals.sent + activity.totals.failed : 0;
    const rate = finished > 0 ? (activity!.totals.sent / finished) * 100 : null;

    const creatorsUsed = PLATFORM_ORDER.reduce((acc, platform) => acc + limits.slots[platform].used, 0);
    const creatorsTotal = PLATFORM_ORDER.reduce((acc, platform) => acc + limits.slots[platform].total, 0);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={<Bell />} label="Notifications" hint="30 days">
                <Value value={notifications} />
                <p className="mt-1 flex items-center gap-1.5 text-sm text-paper/65">
                    {activity === undefined ? (
                        <Skeleton className="h-3 w-28" />
                    ) : change === null ? (
                        <>{thisWeek.toLocaleString("en")} this week</>
                    ) : (
                        <>
                            <span className={cn("inline-flex items-center font-medium", change >= 0 ? "text-ok" : "text-[var(--color-bad-300)]")}>
                                {change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                {Math.abs(change)}%
                            </span>
                            vs the week before
                        </>
                    )}
                </p>
            </Kpi>

            <Kpi icon={<CircleCheck />} label="Delivered" hint="30 days">
                {activity === undefined ? (
                    <Skeleton className="mt-1 h-7 w-20" />
                ) : rate === null ? (
                    <p className="font-display text-[1.875rem] leading-tight text-paper/50">—</p>
                ) : (
                    <Value value={rate} format={(value) => `${value >= 99.95 ? "100" : value.toFixed(1)}%`} />
                )}
                <p className="mt-1 text-sm text-paper/65">
                    {activity
                        ? activity.totals.failed
                            ? `${activity.totals.failed.toLocaleString("en")} failed`
                            : finished
                                ? "Nothing failed"
                                : "Nothing sent yet"
                        : activity === null
                            ? "Not available yet"
                            : " "}
                </p>
            </Kpi>

            <Kpi icon={<Users />} label="Creators" hint={planLabel(limits) ?? undefined}>
                <Value value={creatorsUsed} suffix={` / ${creatorsTotal}`} />
                <div className="mt-2 flex items-center gap-3">
                    {PLATFORM_ORDER.map((platform) => (
                        <span key={platform} className="flex items-center gap-1 text-xs tabular-nums text-paper/65" title={`${platformName(platform)} slots`}>
                            <PlatformIcon platform={platform} className="size-3.5" />
                            <span style={{ color: limits.slots[platform].used >= limits.slots[platform].total ? platformColor(platform) : undefined }}>
                                {limits.slots[platform].used}/{limits.slots[platform].total}
                            </span>
                        </span>
                    ))}
                </div>
            </Kpi>

            <Kpi icon={<Gauge />} label="Counters">
                <Value value={limits.counters.used} suffix={` / ${limits.counters.total}`} />
                <div className="mt-2.5 flex h-1 gap-[3px]" aria-hidden="true">
                    {Array.from({ length: limits.counters.total }).map((_, index) => (
                        <span
                            key={index}
                            className={cn("h-full flex-1 rounded-full", index < limits.counters.used ? "accent-fill" : "bg-paper/[0.08]")}
                        />
                    ))}
                </div>
            </Kpi>
        </div>
    );
}


function Kpi({ icon, label, hint, children }: { icon: React.ReactNode, label: string, hint?: string, children: React.ReactNode }) {
    return (
        <section className="panel rounded-2xl p-5" aria-label={label}>
            <h3 className="flex items-center gap-2.5 text-sm font-medium text-paper/80">
                <span className="icon-chip size-8 [&_svg]:size-4" aria-hidden="true">{icon}</span>
                {label}
                {hint && <span className="ml-auto rounded-full bg-paper/[0.05] px-2 py-0.5 text-xs font-normal text-paper/60">{hint}</span>}
            </h3>
            <div className="mt-3.5">{children}</div>
        </section>
    );
}

function Value({ value, suffix, format }: { value: number, suffix?: string, format?: (value: number) => string }) {
    return (
        <p className="font-display text-[2.25rem] leading-none tracking-tight text-paper">
            <AnimatedNumber value={value} format={format} />
            {suffix && <span className="font-sans text-base font-medium text-paper/50">{suffix}</span>}
        </p>
    );
}


export function PlatformLegend({ overview }: { overview: GuildOverview }) {
    return (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {PLATFORM_ORDER.map((platform) => (
                <li key={platform} className="flex items-center gap-1.5 text-xs text-paper/70">
                    <span className="size-2 rounded-[2px]" style={{ background: CHART_COLORS[platform] }} aria-hidden="true" />
                    {platformName(platform)}
                    <span className="tabular-nums text-paper/85">{(overview.stats.notifications[platform] ?? 0).toLocaleString("en")}</span>
                </li>
            ))}
        </ul>
    );
}

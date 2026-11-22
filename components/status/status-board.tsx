"use client";

import type { ComponentGroup, ComponentStatus, PlatformName, ServiceStatus, StatusHistory } from "@/lib/api/types";
import { CircleCheck, CircleX, Info, TriangleAlert } from "@/components/ui/glyphs";
import { PLATFORM_ORDER, platformColor } from "@/lib/dashboard/platforms";
import { UptimeBars } from "@/components/status/uptime-bars";
import { FadeIn } from "@/components/motion/primitives";
import { useEffect, useMemo, useState } from "react";
import { PlatformIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import { EASE_OUT } from "@/lib/motion";
import { m } from "motion/react";
import cn from "@/lib/cn";


const GROUPS: { id: ComponentGroup, title: string, description: string }[] = [
    { id: "core", title: "Core services", description: "The API, its database and the cache that queues notifications." },
    { id: "bot", title: "Discord bot", description: "The bot's connection to Discord, and the pipeline that turns events into messages." },
    { id: "platforms", title: "Platforms", description: "Oreo's subscriptions to YouTube, Twitch and Kick updates." }
];

const STATUS_TEXT: Record<ComponentStatus, { label: string, className: string, dot: string }> = {
    operational: { label: "Operational", className: "text-ok", dot: "bg-ok" },
    degraded: { label: "Degraded", className: "text-warn", dot: "bg-warn" },
    down: { label: "Down", className: "text-[var(--color-bad-300)]", dot: "bg-bad" }
};

export function StatusBoard({
    status,
    history,
    unreachable,
    checkedAt,
    every,
    headline = "h1"
}: {
    status: ServiceStatus | null;
    history: StatusHistory | null;
    unreachable: boolean;
    checkedAt: number;
    every: number;
    headline?: "h1" | "h2";
}) {
    return (
        <>
            <Overall status={status} unreachable={unreachable} checkedAt={checkedAt} every={every} headline={headline} />

            <div className="mt-14 space-y-12">
                {GROUPS.map((group, index) => (
                    <FadeIn key={group.id} delay={0.05 + index * 0.05}>
                        <Group group={group} status={unreachable ? null : status} history={history} />
                    </FadeIn>
                ))}
            </div>

            <p className="mt-12 flex items-start gap-2 text-xs leading-relaxed text-paper/55">
                <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                Oreo&apos;s API checks every part once a minute and keeps 90 days of results. Days are UTC days. Days without
                measurements are grey.
            </p>
        </>
    );
}


function Overall({
    status,
    unreachable,
    checkedAt,
    every,
    headline: Heading
}: {
    status: ServiceStatus | null;
    unreachable: boolean;
    checkedAt: number;
    every: number;
    headline: "h1" | "h2";
}) {
    if (!status && !unreachable) {
        return (
            <section className="flex items-center gap-4 rounded-3xl border border-cream-200/7 bg-cocoa-800/60 p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_0_var(--color-cocoa-950),0_18px_30px_-18px_rgb(0_0_0/0.9)] sm:p-7" aria-busy="true">
                <span className="size-11 shrink-0 animate-pulse rounded-full bg-paper/[0.06]" aria-hidden="true" />
                <div>
                    <Heading className="font-display text-2xl tracking-tight text-paper/80">Checking Oreo&apos;s systems…</Heading>
                    <p className="mt-0.5 text-sm text-paper/60">This takes a second.</p>
                </div>
            </section>
        );
    }
    const overall: ComponentStatus = unreachable || !status ? "down" : status.status;
    const down = status?.components.filter((component) => component.status === "down") ?? [];
    const degraded = status?.components.filter((component) => component.status === "degraded") ?? [];

    const title = unreachable
        ? "Can't reach Oreo right now"
        : overall === "operational"
            ? "All systems operational"
            : overall === "degraded"
                ? "Some systems are degraded"
                : "Partial outage";
    const detail = unreachable
        ? "Oreo's API didn't answer. Notifications may be delayed until it's back. This page keeps checking."
        : overall === "operational"
            ? "Everything is working. Notifications go out as soon as creators post or go live."
            : [...down, ...degraded].map((component) => `${component.name}${component.detail ? `: ${component.detail}` : ""}`).join(" · ");

    const Icon = overall === "operational" ? CircleCheck : overall === "degraded" ? TriangleAlert : CircleX;
    const tone =
        overall === "operational" ? "border-ok/20 bg-ok/[0.05] text-ok" : overall === "degraded" ? "border-warn/25 bg-warn/[0.06] text-warn" : "border-bad/25 bg-bad/[0.06] text-[var(--color-bad-300)]";

    return (
        <m.section
            className={cn("flex flex-col gap-4 rounded-3xl border p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_0_var(--color-cocoa-950),0_18px_30px_-18px_rgb(0_0_0/0.9)] sm:flex-row sm:items-center sm:p-7", tone)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            aria-live="polite"
        >
            <span className="relative grid size-11 shrink-0 place-items-center">
                {overall !== "operational" && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-current opacity-30" aria-hidden="true" />}
                <Icon className="relative size-8" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <Heading className="font-display text-2xl leading-tight tracking-tight text-paper sm:text-[1.75rem]">{title}</Heading>
                <p className="mt-0.5 text-sm leading-relaxed text-paper/70">{detail}</p>
            </div>
            <Checked checkedAt={checkedAt} every={every} />
        </m.section>
    );
}

function Checked({ checkedAt, every }: { checkedAt: number, every: number }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);
    if (!checkedAt) return null;
    const seconds = Math.max(0, Math.round((now - checkedAt) / 1000));

    return (
        <p className="flex shrink-0 items-center gap-2 text-xs text-paper/60" title={new Date(checkedAt).toLocaleString()}>
            <svg viewBox="0 0 16 16" className="size-4 -rotate-90" aria-hidden="true">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
                <m.circle
                    key={checkedAt}
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: every / 1000, ease: "linear" }}
                />
            </svg>
            Checked {seconds < 5 ? "just now" : `${seconds}s ago`}
        </p>
    );
}


function Group({
    group,
    status,
    history
}: {
    group: (typeof GROUPS)[number];
    status: ServiceStatus | null;
    history: StatusHistory | null;
}) {
    const rows = useMemo(() => {
        const ids = new Set<string>();
        const current = status?.components.filter((component) => component.group === group.id) ?? [];
        const past = history?.components.filter((component) => component.group === group.id) ?? [];
        current.forEach((component) => ids.add(component.id));
        past.forEach((component) => ids.add(component.id));
        return [...ids].map((id) => ({
            id,
            current: current.find((component) => component.id === id),
            history: past.find((component) => component.id === id)
        }));
    }, [status, history, group.id]);

    if (!rows.length) return null;

    return (
        <section aria-labelledby={`group-${group.id}`}>
            <div className="mb-4 px-1">
                <h2 id={`group-${group.id}`} className="font-display text-2xl tracking-[-0.01em] text-cream-100">{group.title}</h2>
                <p className="mt-1 text-cream-100/55">{group.description}</p>
            </div>
            <ul className="divide-hairline rounded-3xl border border-cream-200/7 bg-cocoa-800/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_0_var(--color-cocoa-950),0_18px_30px_-18px_rgb(0_0_0/0.9)]">
                {rows.map((row) => (
                    <li key={row.id} className="px-5 py-5 sm:px-6">
                        <ComponentRow row={row} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

function ComponentRow({
    row
}: {
    row: { id: string, current?: ServiceStatus["components"][number], history?: StatusHistory["components"][number] };
}) {
    const name = row.current?.name ?? row.history?.name ?? row.id;
    const state = row.current?.status;
    const text = state ? STATUS_TEXT[state] : null;
    const days = row.history?.days ?? [];
    const uptime = row.history?.uptime;
    const platform = (PLATFORM_ORDER as string[]).includes(row.id) ? (row.id as PlatformName) : null;

    return (
        <>
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    {platform && (
                        <span style={{ color: platformColor(platform) }} aria-hidden="true">
                            <PlatformIcon platform={platform} className="size-4" />
                        </span>
                    )}
                    <span className="truncate text-[0.9375rem] font-medium text-paper">{name}</span>
                    {row.current?.detail && (
                        <Tooltip content={row.current.detail} focusable label={`${name}: ${row.current.detail}`}>
                            <Info className="size-3.5 text-paper/50" />
                        </Tooltip>
                    )}
                </div>
                {text ? (
                    <span className={cn("flex shrink-0 items-center gap-1.5 text-sm font-medium", text.className)}>
                        <span className={cn("size-2 rounded-full", text.dot, state !== "operational" && "animate-pulse")} aria-hidden="true" />
                        {text.label}
                    </span>
                ) : (
                    <span className="text-sm text-paper/50">Unknown</span>
                )}
            </div>
            {row.current?.detail && <p className="mt-0.5 text-xs text-paper/55 sm:hidden">{row.current.detail}</p>}

            <div className="mt-3">
                {days.length ? <UptimeBars days={days} label={name} /> : <div className="h-9 rounded-[3px] bg-paper/[0.05]" aria-hidden="true" />}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-paper/50">
                <span>
                    <span className="max-sm:hidden">{days.length || 90} days ago</span>
                    <span className="sm:hidden">30 days ago</span>
                </span>
                <span className="font-medium text-paper/70">
                    {uptime === null || uptime === undefined ? "No data yet" : `${uptime >= 99.995 ? "100" : uptime.toFixed(2)}% uptime`}
                </span>
                <span>Today</span>
            </div>
        </>
    );
}

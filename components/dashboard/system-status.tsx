"use client";

import { OVERALL_COPY, overallState, useServiceStatus, type OverallState } from "@/lib/api/status";
import { ArrowRight, TriangleAlert, X } from "@/components/ui/glyphs";
import { Collapse } from "@/components/motion/primitives";
import type { StatusComponent } from "@/lib/api/types";
import { Popover } from "@/components/ui/popover";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import cn from "@/lib/cn";


const DOT: Record<"ok" | "warn" | "bad" | "idle", string> = {
    ok: "text-ok",
    warn: "text-warn",
    bad: "text-bad",
    idle: "text-paper/45"
};

const COMPONENT_DOT: Record<StatusComponent["status"], string> = {
    operational: "bg-ok",
    degraded: "bg-warn",
    down: "bg-bad"
};

function useOverall() {
    const status = useServiceStatus();
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 15_000);
        return () => window.clearInterval(timer);
    }, []);
    const state = overallState(status, now);
    const issues = state === "unreachable" ? [] : (status.data?.components ?? []).filter((component) => component.status !== "operational");
    return { status, state, issues, now };
}

function ago(from: number, now: number) {
    const seconds = Math.max(0, Math.round((now - from) / 1000));
    return seconds < 10 ? "just now" : seconds < 60 ? `${seconds}s ago` : `${Math.round(seconds / 60)} min ago`;
}


export function StatusPill() {
    const { status, state, issues, now } = useOverall();
    const copy = OVERALL_COPY[state];
    const checkedAt = status.data ? Date.parse(status.data.checkedAt) : 0;

    return (
        <Popover
            label="Oreo status"
            width={304}
            trigger={(props, open) => (
                <button
                    {...props}
                    type="button"
                    aria-label={`Oreo status: ${copy.long}`}
                    className={cn(
                        "flex h-9 items-center gap-2 rounded-[0.625rem] px-2.5 text-sm font-medium text-paper/65 transition-colors duration-150 hover:bg-paper/[0.05] hover:text-paper",
                        open && "bg-paper/[0.05] text-paper"
                    )}
                >
                    <span className={cn(state === "operational" || state === "unknown" ? "size-2 rounded-full bg-current" : "live-dot", DOT[copy.tone])} aria-hidden="true" />
                    <span className="hidden lg:inline">{state === "operational" ? "All systems normal" : copy.short}</span>
                </button>
            )}
        >
            {(close) => (
                <div>
                    <div className="border-b border-paper/[0.06] px-3.5 py-3">
                        <p className="text-xs font-medium text-paper/55">Oreo status</p>
                        <p className={cn("mt-0.5 text-sm font-semibold", copy.tone === "ok" ? "text-ok" : copy.tone === "warn" ? "text-warn" : copy.tone === "bad" ? "text-[var(--color-bad-300)]" : "text-paper/70")}>
                            {copy.long}
                        </p>
                        {state === "unreachable" && (
                            <p className="mt-1 text-xs leading-relaxed text-paper/65">Oreo&apos;s API isn&apos;t answering. Changes may not save until it&apos;s back.</p>
                        )}
                    </div>
                    {status.data && state !== "unreachable" && (
                        <ul className="max-h-72 overflow-y-auto px-1.5 py-1.5">
                            {status.data.components.map((component) => (
                                <li key={component.id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5">
                                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", COMPONENT_DOT[component.status])} aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm text-paper/85">{component.name}</span>
                                        {component.detail && component.status !== "operational" && (
                                            <span className="block text-xs leading-relaxed text-paper/60">{component.detail}</span>
                                        )}
                                    </span>
                                    <span className={cn("shrink-0 text-xs", component.status === "operational" ? "text-paper/50" : component.status === "degraded" ? "text-warn" : "text-[var(--color-bad-300)]")}>
                                        {component.status === "operational" ? "OK" : component.status === "degraded" ? "Degraded" : "Down"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="flex items-center justify-between border-t border-paper/[0.06] px-3.5 py-2.5">
                        <span className="text-xs text-paper/50">
                            {checkedAt ? `Checked ${ago(checkedAt, now)}` : issues.length ? "" : "Checking…"}
                        </span>
                        <Link
                            href="/dashboard/status"
                            onClick={close}
                            className="group flex items-center gap-1 text-xs font-medium text-cream-400 transition-colors hover:text-cream-300"
                        >
                            Full status
                            <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            )}
        </Popover>
    );
}


const DISMISS_KEY = "oreo:status-banner";

function describe(state: OverallState, issues: StatusComponent[]) {
    const names = issues.map((component) => component.name).join(", ");
    if (state === "unreachable") return "Oreo's API isn't answering. Notifications may be delayed and changes may not save until it's back.";
    if (state === "down") return `Part of Oreo is down (${names}). Notifications may be delayed.`;
    return `Some of Oreo is having trouble (${names}). Notifications may be delayed.`;
}

export function IncidentBanner() {
    const { state, issues } = useOverall();
    const onStatusPage = usePathname() === "/dashboard/status";
    const signature = `${state}:${issues.map((component) => `${component.id}=${component.status}`).join(",")}`;
    const [dismissed, setDismissed] = useState<string | null>(null);

    useEffect(() => {
        try {
            setDismissed(window.sessionStorage.getItem(DISMISS_KEY));
        } catch {
            // Storage can be blocked, then the banner just can't remember being closed
        }
    }, []);

    const active = state === "degraded" || state === "down" || state === "unreachable";
    const open = active && !onStatusPage && dismissed !== signature;
    const bad = state !== "degraded";

    const dismiss = () => {
        setDismissed(signature);
        try {
            window.sessionStorage.setItem(DISMISS_KEY, signature);
        } catch {
        }
    };

    return (
        <Collapse open={open}>
            <div role="status" className={cn("border-b", bad ? "border-bad/20 bg-bad/[0.07]" : "border-warn/20 bg-warn/[0.06]")}>
                <div className="mx-auto flex w-full max-w-[76rem] items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
                    <TriangleAlert className={cn("size-4 shrink-0", bad ? "text-[var(--color-bad-300)]" : "text-warn")} aria-hidden="true" />
                    <p className="min-w-0 flex-1 text-sm leading-snug text-paper/75">{describe(state, issues)}</p>
                    <Link
                        href="/dashboard/status"
                        className="group hidden shrink-0 items-center gap-1 text-xs font-medium text-paper/70 transition-colors hover:text-paper sm:flex"
                    >
                        Status
                        <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label="Hide this notice"
                        className="grid size-7 shrink-0 place-items-center rounded-md text-paper/60 transition-colors hover:bg-paper/[0.06] hover:text-paper"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            </div>
        </Collapse>
    );
}

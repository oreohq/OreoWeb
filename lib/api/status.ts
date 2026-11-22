"use client";

import type { ServiceStatus, StatusHistory } from "@/lib/api/types";
import { revalidate, useApi } from "@/lib/api/hooks";
import { paths } from "@/lib/api/client";
import { useEffect } from "react";


const pollers = new Map<string, { watchers: number, stop: () => void }>();

function watch(key: string, every: number) {
    let poller = pollers.get(key);
    if (!poller) {
        const refresh = () => {
            if (document.visibilityState === "visible") void revalidate(key);
        };
        const timer = window.setInterval(refresh, every);
        document.addEventListener("visibilitychange", refresh);
        poller = {
            watchers: 0,
            stop: () => {
                window.clearInterval(timer);
                document.removeEventListener("visibilitychange", refresh);
            }
        };
        pollers.set(key, poller);
    }
    poller.watchers += 1;

    return () => {
        const current = pollers.get(key);
        if (!current) return;
        current.watchers -= 1;
        if (current.watchers <= 0) {
            current.stop();
            pollers.delete(key);
        }
    };
}

function usePolled<T>(key: string, every: number) {
    const state = useApi<T>(key);
    useEffect(() => watch(key, every), [key, every]);
    return state;
}

export function useServiceStatus() {
    return usePolled<ServiceStatus>(paths.status, 30_000);
}

export function useStatusHistory(days = 90) {
    return usePolled<StatusHistory>(paths.statusHistory(days), 5 * 60_000);
}


export type OverallState = "operational" | "degraded" | "down" | "unreachable" | "unknown";

const STALE_AFTER = 75_000;

export function overallState(state: { data?: ServiceStatus, error?: unknown, updatedAt: number }, now = Date.now()): OverallState {
    if (state.error && (!state.data || now - state.updatedAt > STALE_AFTER)) return "unreachable";
    if (!state.data) return "unknown";
    return state.data.status;
}

export const OVERALL_COPY: Record<OverallState, { short: string, long: string, tone: "ok" | "warn" | "bad" | "idle" }> = {
    operational: { short: "Operational", long: "All systems operational", tone: "ok" },
    degraded: { short: "Degraded", long: "Some systems are degraded", tone: "warn" },
    down: { short: "Outage", long: "Partial outage", tone: "bad" },
    unreachable: { short: "Unreachable", long: "Can't reach Oreo right now", tone: "bad" },
    unknown: { short: "Checking", long: "Checking Oreo's systems…", tone: "idle" }
};

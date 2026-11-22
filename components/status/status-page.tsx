"use client";

import type { ServiceStatus, StatusHistory } from "@/lib/api/types";
import { StatusBoard } from "@/components/status/status-board";
import { MotionProvider } from "@/components/motion/provider";
import { useEffect, useState } from "react";


const STATUS_EVERY = 30_000;
const HISTORY_EVERY = 5 * 60_000;


function usePoll<T>(path: string, initial: T | null, every: number) {
    const [data, setData] = useState<T | null>(initial);
    const [failed, setFailed] = useState(false);
    // Stamped in the browser only, so the server render and the first client render agree
    const [checkedAt, setCheckedAt] = useState(0);

    useEffect(() => {
        if (initial) setCheckedAt(Date.now());
    }, []);

    useEffect(() => {
        let timer = 0;
        let controller: AbortController | null = null;

        const run = async () => {
            window.clearTimeout(timer);
            if (document.visibilityState === "hidden") return;
            controller?.abort();
            controller = new AbortController();
            try {
                const response = await fetch(`/api${path}`, { cache: "no-store", signal: controller.signal });
                const body = (await response.json().catch(() => null)) as { success?: boolean, data?: T } | null;
                if (response.ok && body?.success && body.data) {
                    setData(body.data);
                    setFailed(false);
                } else {
                    setFailed(true);
                }
                setCheckedAt(Date.now());
            } catch (error) {
                if ((error as Error).name === "AbortError") return;
                setFailed(true);
                setCheckedAt(Date.now());
            }
            timer = window.setTimeout(run, every);
        };

        const onVisible = () => document.visibilityState === "visible" && void run();
        timer = window.setTimeout(run, initial ? every : 0);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearTimeout(timer);
            controller?.abort();
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [path, every]);

    return { data, failed, checkedAt };
}


export function StatusPage({ initialStatus, initialHistory }: { initialStatus: ServiceStatus | null, initialHistory: StatusHistory | null }) {
    const status = usePoll<ServiceStatus>("/v1/status", initialStatus, STATUS_EVERY);
    const history = usePoll<StatusHistory>("/v1/status/history?days=90", initialHistory, HISTORY_EVERY);
    const unreachable = status.failed;

    return (
        <MotionProvider>
            <div data-app="status" className="relative text-paper">
                <div
                    className="pointer-events-none absolute inset-x-0 -top-20 h-96 opacity-50 blur-[120px]"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, #FFA27733 0%, transparent 65%)" }}
                    aria-hidden="true"
                />
                <div className="relative mx-auto w-full max-w-[56rem] px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
                    <StatusBoard
                        status={status.data}
                        history={history.data}
                        unreachable={unreachable}
                        checkedAt={status.checkedAt}
                        every={STATUS_EVERY}
                    />
                </div>
            </div>
        </MotionProvider>
    );
}

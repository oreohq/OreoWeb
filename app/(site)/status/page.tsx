import type { ServiceStatus, StatusHistory } from "@/lib/api/types";
import { StatusPage } from "@/components/status/status-page";
import { pageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";


export const metadata: Metadata = pageMetadata({
    title: "Status",
    description: "Live status and 90-day uptime of Oreo's API, Discord bot, notification pipeline and platform connections.",
    path: "/status"
});

async function load<T>(path: string, revalidate: number): Promise<T | null> {
    const api = process.env.API_URL?.replace(/\/+$/, "");
    if (!api) return null;
    try {
        const response = await fetch(`${api}${path}`, {
            ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
            signal: AbortSignal.timeout(3000)
        });
        if (!response.ok) return null;
        const body = (await response.json()) as { success?: boolean, data?: T };
        return body.success && body.data ? body.data : null;
    } catch {
        return null;
    }
}


export default async function Status() {
    const [status, history] = await Promise.all([
        load<ServiceStatus>("/v1/status", 0),
        load<StatusHistory>("/v1/status/history?days=90", 60)
    ]);

    return <StatusPage initialStatus={status} initialHistory={history} />;
}

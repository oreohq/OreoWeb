export type Status = "not_monitored" | "operational" | "downtime" | "maintenance" | "degraded" | "partial";
export type HistoryStatus = "operational" | "downtime" | "recovered" | "maintance" | "degraded";
export interface StatusHistory {
    day: string;
    downtime_duration: number;
    maintenance_duration: number; 
    status: "operational" | "downtime" | "recovered" | "maintance" | "degraded";
}
export interface StatusResource {
    id: string;
    attributes: {
        resource_id: number;
        public_name: string;
        availability: number;
        status_history: StatusHistory[];
        status: "not_monitored" | "operational" | "downtime" | "maintenance" | "degraded";
    }
}

export interface ClusterResource {
    id: number;
    name: string;
    ping: number;
    memory: number;
    guilds: number;
    uptime: number;
    users: number;
}

export const ResourceIDS = {
    oreoProd: 3006635,
    oreoStaging: 3006637,
    oreoApi: 3006638,
    oreoWeb: 3006641
}


export async function fetchBetterStackStatus(): Promise<{ data: StatusResource[] | undefined }> {
    const result = await fetch(`${process.env.NEXT_BETTERSTACK_API}`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_BETTERSTACK_TOKEN}` },
        next: { revalidate: 60 }
    }).catch(e => null);
    return result ? result.json() : null;
}


export async function fetchBotApiStatus(): Promise<{ clusters: { [key: string]: ClusterResource } } | undefined> {
    const result = await fetch(`${process.env.NEXT_PUBLIC_API}/status`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}` },
        next: { revalidate: 60 }
    }).catch(e => null);
    return result ? result.json() : null;
}
import { CountersPage } from "@/components/dashboard/counters/counters-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Counters" };

interface Props {
    params: Promise<{ guildId: string }>;
}

export default async function GuildCountersPage({ params }: Props) {
    const { guildId } = await params;
    return <CountersPage guildId={guildId} />;
}

import { OverviewPage } from "@/components/dashboard/overview/overview-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Server overview" };

interface Props {
    params: Promise<{ guildId: string }>;
}

export default async function GuildPage({ params }: Props) {
    const { guildId } = await params;
    return <OverviewPage guildId={guildId} />;
}

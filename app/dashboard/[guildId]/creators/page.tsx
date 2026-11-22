import { CreatorsPage } from "@/components/dashboard/creators/creators-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Creators" };

interface Props {
    params: Promise<{ guildId: string }>;
}

export default async function GuildCreatorsPage({ params }: Props) {
    const { guildId } = await params;
    return <CreatorsPage guildId={guildId} />;
}

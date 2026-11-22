import { GuildGate } from "@/components/dashboard/overview/gate";


interface Props {
    children: React.ReactNode;
    params: Promise<{ guildId: string }>;
}

export default async function GuildLayout({ children, params }: Props) {
    const { guildId } = await params;
    return <GuildGate guildId={guildId}>{children}</GuildGate>;
}

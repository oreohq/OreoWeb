import { EditorPage } from "@/components/dashboard/editor/editor-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Edit creator" };

interface Props {
    params: Promise<{ guildId: string, id: string }>;
}

export default async function CreatorPage({ params }: Props) {
    const { guildId, id } = await params;
    return <EditorPage guildId={guildId} creatorId={Number(id)} />;
}

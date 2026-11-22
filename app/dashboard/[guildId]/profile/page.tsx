import { ProfilePage } from "@/components/dashboard/profile/profile-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Bot profile" };

interface Props {
    params: Promise<{ guildId: string }>;
}

export default async function ProfileRoute({ params }: Props) {
    const { guildId } = await params;
    return <ProfilePage guildId={guildId} />;
}

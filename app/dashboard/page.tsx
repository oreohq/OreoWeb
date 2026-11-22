import { ServersPage } from "@/components/dashboard/servers/servers-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Your servers" };

export default function DashboardPage() {
    return <ServersPage />;
}

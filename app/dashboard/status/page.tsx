import { DashboardStatusPage } from "@/components/dashboard/status/status-page";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Status" };

export default function StatusRoute() {
    return <DashboardStatusPage />;
}

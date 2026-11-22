import { DashboardShell } from "@/components/dashboard/shell";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage Oreo's notifications, counters and roles for your Discord servers.",
    robots: { index: false, follow: false }
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <DashboardShell>{children}</DashboardShell>;
}

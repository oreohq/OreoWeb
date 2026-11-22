import { PremiumPage } from "@/components/dashboard/premium/premium-page";
import { premiumEnabled } from "@/lib/premium";
import { notFound } from "next/navigation";
import type { Metadata } from "next";


export const metadata: Metadata = { title: premiumEnabled ? "Premium" : "Page not found" };

export default function PremiumRoute() {
    if (!premiumEnabled) notFound();
    return <PremiumPage />;
}

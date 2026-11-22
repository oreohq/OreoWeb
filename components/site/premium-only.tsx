import { premiumEnabled } from "@/lib/premium";


export function PremiumOnly({ children }: { children: React.ReactNode }) {
    return premiumEnabled ? children : null;
}

export function PremiumOff({ children }: { children: React.ReactNode }) {
    return premiumEnabled ? null : children;
}

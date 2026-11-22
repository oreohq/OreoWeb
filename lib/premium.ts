import type { GuildLimits } from "@/lib/api/types";

/** Premium sales stay hidden until launch. Servers given premium by hand still show it. */
export const premiumEnabled = process.env.NEXT_PUBLIC_PREMIUM === "true";

export const premiumOnSale = (limits: GuildLimits | undefined) => premiumEnabled && limits?.premiumOnSale === true;

export const PREMIUM_GUIDE_PAGES = ["premium", "bot-profile"];

export const planLabel = (limits: GuildLimits) => (limits.premium ? "Premium" : premiumEnabled ? "Free plan" : null);

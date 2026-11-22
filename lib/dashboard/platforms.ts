import type { ContentType, CounterMetric, PlatformName } from "@/lib/api/types";
import { PLATFORM_CONTENT_TYPES, PLATFORM_METRICS } from "@/lib/api/types";
import { platforms } from "@/lib/platforms";

export { PLATFORM_CONTENT_TYPES, PLATFORM_METRICS };


export const PLATFORM_ORDER: PlatformName[] = ["youtube", "twitch", "kick"];

export const platformName = (platform: PlatformName) => platforms[platform].name;
export const platformColor = (platform: PlatformName) => platforms[platform].color;

/** Kick's neon green is too light on dark surfaces, so marks use a deeper step */
export const CHART_COLORS: Record<PlatformName, string> = {
    youtube: "#FF0033",
    twitch: "#9146FF",
    kick: "#34A90E"
};

export const DEFAULT_YOUTUBE_CONTENT_TYPES: ContentType[] = PLATFORM_CONTENT_TYPES.youtube.filter((type) => type !== "members");

export const CONTENT_TYPE_NAMES: Record<ContentType, { one: string, many: string }> = {
    live: { one: "Livestream", many: "Livestreams" },
    video: { one: "Video", many: "Videos" },
    premiere: { one: "Premiere", many: "Premieres" },
    shorts: { one: "Short", many: "Shorts" },
    members: { one: "Members-only post", many: "Members-only posts" }
};

export const LOOKUP_HINTS: Record<PlatformName, { label: string, placeholder: string, help: string }> = {
    youtube: {
        label: "YouTube channel",
        placeholder: "youtube.com/@handle or @handle",
        help: "Paste the channel link, its @handle, or a channel id (UC…)."
    },
    twitch: {
        label: "Twitch channel",
        placeholder: "twitch.tv/name or name",
        help: "Paste the channel link or type the streamer's login."
    },
    kick: {
        label: "Kick channel",
        placeholder: "kick.com/name or name",
        help: "Paste the channel link or type the channel's name."
    }
};


/** Mirrors the API's default counter names (guilds.defaults.ts) */
export const DEFAULT_COUNTER_TEMPLATES: Record<CounterMetric, string> = {
    subscribers: "📺 {name}: {count} subs",
    followers: "👥 {name}: {count} followers",
    videos: "🎬 {name}: {count} videos",
    views: "👀 {name}: {count} views"
};

export const SAMPLE_COUNTS: Record<CounterMetric, number> = {
    subscribers: 128_400,
    followers: 24_318,
    videos: 342,
    views: 12_845_210
};

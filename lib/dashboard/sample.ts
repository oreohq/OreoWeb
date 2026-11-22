import type { Content, ContentType, Creator } from "@/lib/api/types";


export type PreviewState = "live" | "ended";

const THUMBNAIL = "https://oreo.aniket.zip/assets/thumbnail.png";

const TITLES: Record<ContentType, string> = {
    live: "late night ranked grind until we hit the top 🍪",
    video: "I built a cookie factory in 24 hours",
    premiere: "The Oreo Factory — a documentary (world premiere)",
    shorts: "POV: the cream-to-cookie ratio is perfect #shorts",
    members: "Members only: the secret cookie recipe, step by step"
};

const DESCRIPTIONS: Record<ContentType, string> = {
    live: "Come hang out! Climbing ranked, answering questions and eating far too many cookies.\nSocials in the panels below.",
    video: "Twenty-four hours, one very ambitious cookie factory, and absolutely no sleep.\nTimestamps below.",
    premiere: "Join the live chat for the premiere of our biggest video yet.\nThanks for watching!",
    shorts: "The perfect cookie exists. #shorts",
    members: "A thank-you to everyone who supports the channel, with the recipe I never share."
};

const CATEGORIES: Record<Creator["platform"], Record<ContentType, string>> = {
    youtube: { live: "Gaming", video: "Entertainment", premiere: "Film & Animation", shorts: "Comedy", members: "Entertainment" },
    twitch: { live: "Just Chatting", video: "Just Chatting", premiere: "Just Chatting", shorts: "Just Chatting", members: "Just Chatting" },
    kick: { live: "Just Chatting", video: "Just Chatting", premiere: "Just Chatting", shorts: "Just Chatting", members: "Just Chatting" }
};


export function sampleContent(creator: Creator, type: ContentType, state: PreviewState, now: number): Content {
    const ended = type === "live" && state === "ended";
    const minute = 60_000;
    const startedAt = new Date(now - (type === "live" ? (ended ? 134 * minute : 12 * minute) : 2 * minute));

    let url = creator.url;
    let vodUrl: string | null = null;
    if (creator.platform === "youtube") {
        url = type === "shorts" ? "https://www.youtube.com/shorts/Oreo_Preview" : "https://www.youtube.com/watch?v=Oreo_Preview";
        vodUrl = ended ? url : null;
    } else if (creator.platform === "twitch") {
        vodUrl = ended ? "https://www.twitch.tv/videos/2200000000" : null;
    }

    return {
        id: "oreo-preview",
        type,
        title: TITLES[type],
        description: DESCRIPTIONS[type],
        url,
        thumbnail: THUMBNAIL,
        category: CATEGORIES[creator.platform][type],
        startedAt: startedAt.toISOString(),
        endedAt: ended ? new Date(now - 3 * minute).toISOString() : null,
        vodUrl,
        channel: {
            id: creator.platformId,
            username: creator.username,
            displayName: creator.displayName,
            avatarUrl: creator.avatarUrl,
            url: creator.url
        }
    };
}

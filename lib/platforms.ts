export type PlatformId = "youtube" | "twitch" | "kick";

export interface Platform {
    id: PlatformId;
    name: string;
    color: string;
    text: string;
    events: string[];
    creator: string;
    handle: string;
    title: string;
    category: string;
    accent: string;
}

export const platforms: Record<PlatformId, Platform> = {
    youtube: {
        id: "youtube",
        name: "YouTube",
        color: "#FF0033",
        text: "text-youtube",
        events: ["Videos", "Premieres", "Shorts", "Livestreams"],
        creator: "Krutika Plays",
        handle: "@krutikaplays",
        title: "the ONLY loadout you need in BGMI",
        category: "Gaming · Live",
        accent: "from-[#FF0033]/22"
    },
    twitch: {
        id: "twitch",
        name: "Twitch",
        color: "#9146FF",
        text: "text-twitch",
        events: ["Livestreams", "VODs", "Title updates"],
        creator: "ReGaLToS",
        handle: "@regaltos",
        title: "ranked grind until we hit conqueror",
        category: "Just Chatting",
        accent: "from-[#9146FF]/22"
    },
    kick: {
        id: "kick",
        name: "Kick",
        color: "#53FC18",
        text: "text-kick",
        events: ["Livestreams", "VODs", "Category swaps"],
        creator: "MAMBA",
        handle: "@mamba",
        title: "late night customs w/ the squad 🐍",
        category: "Battlegrounds Mobile India",
        accent: "from-[#53FC18]/18"
    }
};

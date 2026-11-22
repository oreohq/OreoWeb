// The bot's emojis (OreoApp/src/shared/constants/emoji-ids.json), so the preview shows what it posts
const emoji = (id: string) => `https://cdn.discordapp.com/emojis/${id}.png?size=64`;

export const PLATFORM_ICONS = {
    youtube: emoji("1572952582991642634"),
    twitch: emoji("1572952509855572128"),
    kick: emoji("1572951883805499433")
};

export const BUTTON_EMOJIS = { link: emoji("1572951909042626622"), role: emoji("1572952273896734940") };

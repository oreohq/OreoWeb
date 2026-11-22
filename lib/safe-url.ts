export function safeUrl(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
    } catch {
        return undefined;
    }
}

export function discordMessageUrl(guildId: string, channelId: string | null, messageId: string | null): string | undefined {
    const snowflake = /^\d{15,21}$/;
    if (!snowflake.test(guildId) || !channelId || !snowflake.test(channelId) || !messageId || !snowflake.test(messageId)) return undefined;
    return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

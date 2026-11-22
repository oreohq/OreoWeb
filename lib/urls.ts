export const getBaseUrl = () => {
    return process.env.PUBLIC_BASE_URL ?? "http://localhost:3100";
};

/** Usual messaging permissions, plus Manage Channels for counters and Manage Roles for live roles and the Notify me button */
const BOT_PERMISSIONS = "268921936";

const inviteUrl = `https://discord.com/oauth2/authorize?client_id=1021275413969899580&permissions=${BOT_PERMISSIONS}&integration_type=0&scope=bot+applications.commands`;

export const redirects: Record<string, string> = {
    discord: "https://discord.gg/KsWaypC8hH",
    support: "https://discord.gg/KsWaypC8hH",
    topgg: "https://top.gg/bot/1021275413969899580",
    vote: "https://top.gg/bot/1021275413969899580/vote",
    add: inviteUrl,
    invite: inviteUrl,
    kofi: "https://ko-fi.com/aniket091"
};

export function guildInviteUrl(guildId: string) {
    return `${inviteUrl}&guild_id=${encodeURIComponent(guildId)}&disable_guild_select=true`;
}

export function loginUrl(redirect = "/dashboard") {
    return `/api/v1/auth/login?redirect=${encodeURIComponent(redirect)}`;
}

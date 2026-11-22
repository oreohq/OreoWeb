import type { GuildResources, ResourceChannelType } from "@/lib/api/types";


export type ResourceChannel = GuildResources["channels"][number];

export const SENDABLE_TYPES: ResourceChannelType[] = ["text", "announcement"];
/** Never a text channel, so a counter can't take over #rules or #announcements */
export const COUNTER_TYPES: ResourceChannelType[] = ["voice", "stage", "category"];


export const PERMISSIONS: Record<string, { label: string, why: string }> = {
    ViewChannel: { label: "View Channels", why: "see the channels it posts in" },
    SendMessages: { label: "Send Messages", why: "post notifications" },
    EmbedLinks: { label: "Embed Links", why: "attach the notification embed" },
    MentionEveryone: { label: "Mention @everyone, @here and All Roles", why: "ping your roles" },
    ManageRoles: { label: "Manage Roles", why: "hand out live roles and the 🔔 Notify me role" },
    ManageChannels: { label: "Manage Channels", why: "create and rename counter channels" }
};

export function permissionLabel(name: string) {
    return PERMISSIONS[name]?.label ?? name.replace(/([a-z])([A-Z])/g, "$1 $2");
}


const VOICE_LIKE: ResourceChannelType[] = ["voice", "stage"];

export function sidebarOrder(channels: ResourceChannel[], include: (channel: ResourceChannel) => boolean) {
    const categories = channels.filter((channel) => channel.type === "category").sort((a, b) => a.position - b.position);
    const known = new Set(categories.map((category) => category.id));
    const rank = (channel: ResourceChannel) => (VOICE_LIKE.includes(channel.type) ? 1 : 0);
    const sort = (a: ResourceChannel, b: ResourceChannel) => rank(a) - rank(b) || a.position - b.position;

    const result: { channel: ResourceChannel, group: string }[] = [];
    const children = channels.filter((channel) => channel.type !== "category" && include(channel));

    for (const channel of children.filter((item) => !item.parentId || !known.has(item.parentId)).sort(sort)) {
        result.push({ channel, group: "No category" });
    }
    for (const category of categories) {
        for (const channel of children.filter((item) => item.parentId === category.id).sort(sort)) {
            result.push({ channel, group: category.name });
        }
    }
    return result;
}



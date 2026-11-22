import type { ContentType, EmbedConfig, GuildCreator, MessageTemplates, PingOverrides } from "@/lib/api/types";
import { CONTENT_TYPES, MAX_PING_ROLES, allPingRoles } from "@/lib/api/types";


export type CreatorPatch = Partial<
    Pick<
        GuildCreator,
        "enabled" | "channelId" | "contentTypes" | "pingRoles" | "pingOverrides" | "publishPosts" | "watchButton" | "notifyButton" | "onStreamEnd" | "liveRoleId" | "liveUserId"
    >
> & {
    messages?: Partial<MessageTemplates>;
    embed?: Partial<EmbedConfig>;
};

const SCALARS = [
    "enabled",
    "channelId",
    "publishPosts",
    "watchButton",
    "notifyButton",
    "onStreamEnd",
    "liveRoleId",
    "liveUserId"
] as const;

const EMBED_KEYS: (keyof EmbedConfig)[] = [
    "enabled", "color", "author", "authorIcon", "title", "linkTitle", "description", "thumbnail", "image", "footer", "timestamp", "showCategory"
];

export const LIMITS = { message: 1500, author: 256, title: 256, description: 1024, footer: 256, image: 512 } as const;

const IMAGE_PLACEHOLDERS = ["{channel.avatar}", "{video.thumbnail}"] as const;


const sameTypes = (a: ContentType[], b: ContentType[]) => a.length === b.length && a.every((type) => b.includes(type));

const sameRoles = (a: string[], b: string[]) => a.length === b.length && a.every((role) => b.includes(role));

const sameOverrides = (a: PingOverrides, b: PingOverrides) =>
    CONTENT_TYPES.every((type) => (a[type] === undefined) === (b[type] === undefined) && sameRoles(a[type] ?? [], b[type] ?? []));


/** Only what changed, so a save never overwrites settings someone else edited meanwhile */
export function buildPatch(base: GuildCreator, draft: GuildCreator): CreatorPatch {
    const patch: CreatorPatch = {};

    for (const key of SCALARS) {
        if (draft[key] !== base[key]) (patch as Record<string, unknown>)[key] = draft[key];
    }
    if (!sameRoles(draft.pingRoles, base.pingRoles)) patch.pingRoles = draft.pingRoles;
    // The API takes the whole map of per-kind lists, so one changed kind sends them all
    if (!sameOverrides(draft.pingOverrides, base.pingOverrides)) patch.pingOverrides = draft.pingOverrides;
    if (!sameTypes(draft.contentTypes, base.contentTypes)) patch.contentTypes = CONTENT_TYPES.filter((type) => draft.contentTypes.includes(type));

    const messages: Partial<MessageTemplates> = {};
    for (const type of CONTENT_TYPES) {
        if (draft.messages[type] !== base.messages[type]) messages[type] = draft.messages[type];
    }
    if (Object.keys(messages).length) patch.messages = messages;

    const embed: Partial<EmbedConfig> = {};
    for (const key of EMBED_KEYS) {
        if (draft.embed[key] !== base.embed[key]) (embed as Record<string, unknown>)[key] = draft.embed[key];
    }
    if (Object.keys(embed).length) patch.embed = embed;

    return patch;
}

export function upgradePatch(raw: unknown): CreatorPatch {
    if (!raw || typeof raw !== "object") return {};
    const old = raw as Record<string, unknown>;
    const { pingRoleId, ...rest } = old;
    const patch: Record<string, unknown> = { ...rest };

    if (typeof pingRoleId === "string" && patch.pingRoles === undefined) patch.pingRoles = [pingRoleId];
    else if (pingRoleId === null && patch.pingRoles === undefined) patch.pingRoles = [];

    const isRoleList = (value: unknown): value is string[] => Array.isArray(value) && value.length <= MAX_PING_ROLES && value.every((id) => typeof id === "string");
    if (patch.pingRoles !== undefined && !isRoleList(patch.pingRoles)) delete patch.pingRoles;
    if (patch.pingOverrides !== undefined) {
        const overrides: PingOverrides = {};
        const source = patch.pingOverrides && typeof patch.pingOverrides === "object" ? (patch.pingOverrides as Record<string, unknown>) : {};
        for (const type of CONTENT_TYPES) if (isRoleList(source[type])) overrides[type] = source[type] as string[];
        patch.pingOverrides = overrides;
    }

    if (Array.isArray(patch.contentTypes)) {
        const types = (patch.contentTypes as unknown[]).map((type) => (type === "stream" ? "live" : type)).filter((type): type is ContentType => CONTENT_TYPES.includes(type as ContentType));
        patch.contentTypes = types;
    }
    if (patch.messages !== undefined && (typeof patch.messages !== "object" || patch.messages === null)) delete patch.messages;
    if (patch.messages && typeof patch.messages === "object") {
        const { stream, ...messages } = patch.messages as Record<string, unknown>;
        patch.messages = typeof stream === "string" && messages.live === undefined ? { ...messages, live: stream } : messages;
    }
    return patch as CreatorPatch;
}

export function applyPatch(base: GuildCreator, patch: CreatorPatch): GuildCreator {
    return {
        ...base,
        ...(patch as Partial<GuildCreator>),
        messages: patch.messages ? { ...base.messages, ...patch.messages } : base.messages,
        embed: patch.embed ? { ...base.embed, ...patch.embed } : base.embed
    };
}

export function countChanges(patch: CreatorPatch): number {
    return Object.entries(patch).reduce(
        (sum, [key, value]) => sum + (key === "messages" || key === "embed" ? Object.keys(value as object).length : 1),
        0
    );
}


export function imageFieldError(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed || (IMAGE_PLACEHOLDERS as readonly string[]).includes(trimmed)) return null;
    if (trimmed.length > LIMITS.image) return `Keep the link under ${LIMITS.image} characters.`;
    if (!/^https:\/\/\S+$/i.test(trimmed)) return "Use an https:// image link.";
    return null;
}

export type Errors = Partial<Record<string, string>>;

export function validate(draft: GuildCreator): Errors {
    const errors: Errors = {};

    if (!draft.contentTypes.length) errors.contentTypes = "Pick at least one kind of post.";
    for (const type of CONTENT_TYPES) {
        if ((draft.messages[type] ?? "").length > LIMITS.message) errors[`messages.${type}`] = `Keep it under ${LIMITS.message} characters.`;
    }

    const embed = draft.embed;
    if (embed.author.length > LIMITS.author) errors["embed.author"] = `Keep it under ${LIMITS.author} characters.`;
    if (embed.title.length > LIMITS.title) errors["embed.title"] = `Keep it under ${LIMITS.title} characters.`;
    if (embed.description.length > LIMITS.description) errors["embed.description"] = `Keep it under ${LIMITS.description} characters.`;
    if (embed.footer.length > LIMITS.footer) errors["embed.footer"] = `Keep it under ${LIMITS.footer} characters.`;
    if (embed.color !== null && !/^#[0-9a-f]{6}$/i.test(embed.color)) errors["embed.color"] = "Use a hex colour like #FFA277.";
    for (const key of ["authorIcon", "thumbnail", "image"] as const) {
        const error = imageFieldError(embed[key]);
        if (error) errors[`embed.${key}`] = error;
    }

    if (draft.pingRoles.length > MAX_PING_ROLES) errors.pingRoles = `Up to ${MAX_PING_ROLES} roles.`;
    for (const type of CONTENT_TYPES) {
        if ((draft.pingOverrides[type]?.length ?? 0) > MAX_PING_ROLES) errors[`pingOverrides.${type}`] = `Up to ${MAX_PING_ROLES} roles.`;
    }
    if (draft.notifyButton && !allPingRoles(draft).length) errors.notifyButton = "The button needs at least one ping role.";

    if (draft.liveUserId !== null && !/^\d{17,20}$/.test(draft.liveUserId)) {
        errors.liveUserId = "A Discord user id is 17 to 20 digits.";
    }
    return errors;
}

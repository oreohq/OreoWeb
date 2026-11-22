"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
    Bell,
    BellOff,
    Hash,
    LayoutPanelTop,
    LoaderCircle,
    Megaphone,
    MessageSquareText,
    MousePointerClick,
    Radio,
    RefreshCw,
    RotateCcw,
    Settings,
    Trash,
    TriangleAlert,
    UserRound
} from "@/components/ui/glyphs";
import { MAX_PING_ROLES, allPingRoles, pingRolesFor, type ContentType, type EmbedConfig, type GuildCreator, type GuildResources, type PingOverrides, type StreamEndAction } from "@/lib/api/types";
import { ColorPicker, ContentTypePicker, ImageField, RoleDot, SectionCard, contentIcon } from "@/components/dashboard/editor/fields";
import { CONTENT_TYPE_NAMES, PLATFORM_CONTENT_TYPES, platformName } from "@/lib/dashboard/platforms";
import { LIMITS, type Errors } from "@/components/dashboard/editor/model";
import { SENDABLE_TYPES, sidebarOrder } from "@/lib/dashboard/resources";
import { TemplateField } from "@/components/dashboard/template-field";
import { Combobox, type ComboOption } from "@/components/ui/combobox";
import { PickerFallback } from "@/components/dashboard/options";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { PLACEHOLDERS } from "@/lib/dashboard/placeholders";
import { Field, inputClasses } from "@/components/ui/field";
import { paths, type ApiError } from "@/lib/api/client";
import { Segmented } from "@/components/ui/segmented";
import { SwitchField } from "@/components/ui/switch";
import { Tabs, tabIds } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useApi } from "@/lib/api/hooks";
import cn from "@/lib/cn";


export interface SectionProps {
    draft: GuildCreator;
    set: <K extends keyof GuildCreator>(key: K, value: GuildCreator[K]) => void;
    resources: GuildResources | undefined;
    errors: Errors;
    resourcesError?: ApiError;
    onRetryResources?: () => void;
}


export function GeneralSection({
    draft,
    set,
    resources,
    errors,
    resourcesError,
    onRetryResources,
    onRefreshResources,
    refreshing
}: SectionProps & { onRefreshResources: () => void, refreshing: boolean }) {
    const channelLabel = useId();
    const typesLabel = useId();
    const platform = draft.creator.platform;
    const channel = draft.channelId ? resources?.channels.find((item) => item.id === draft.channelId) : undefined;
    const announcement = channel?.type === "announcement";

    const options = useMemo<ComboOption[]>(
        () =>
            resources
                ? sidebarOrder(resources.channels, (item) => SENDABLE_TYPES.includes(item.type)).map(({ channel: item, group }) => ({
                      value: item.id,
                      label: item.name,
                      group,
                      icon: item.type === "announcement" ? <Megaphone className="size-4" /> : <Hash className="size-4" />,
                      warn: !item.canSend,
                      hint: !item.canSend ? "Can't post" : item.type === "announcement" ? "Announcement" : undefined,
                      keywords: item.type
                  }))
                : [],
        [resources]
    );

    return (
        <SectionCard
            id="general"
            icon={<Settings className="size-5" />}
            title="General"
            description={`Where Oreo posts about ${draft.creator.displayName}, and what it posts.`}
        >
            <SwitchField
                label="Post notifications"
                description={draft.enabled ? "On: Oreo posts whenever they go live or upload." : "Paused: settings are kept, but nothing is posted."}
                checked={draft.enabled}
                onChange={(value) => set("enabled", value)}
            />

            <Field
                label="Channel"
                labelId={channelLabel}
                description="Text and announcement channels in this server."
                aside={
                    <button
                        type="button"
                        onClick={onRefreshResources}
                        disabled={refreshing}
                        className="flex items-center gap-1 text-xs font-medium text-paper/60 transition-colors hover:text-paper disabled:opacity-50"
                    >
                        {refreshing ? <LoaderCircle className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                        Refresh list
                    </button>
                }
            >
                {resources ? (
                    <Combobox
                        value={draft.channelId}
                        onChange={(value) => set("channelId", value)}
                        options={options}
                        placeholder="Pick a channel"
                        searchPlaceholder="Search channels"
                        emptyText="No text channels match."
                        missingLabel="Unknown channel, it may have been deleted"
                        searchable
                        aria-labelledby={channelLabel}
                    />
                ) : (
                    <PickerFallback error={resourcesError} onRetry={onRetryResources} />
                )}
            </Field>

            {!draft.channelId && (
                <Callout tone="warning" title="No channel yet">
                    Pick where notifications go. Until then, nothing is posted.
                </Callout>
            )}
            {channel && !channel.canSend && (
                <Callout tone="warning" title={`Oreo can't post in #${channel.name}`}>
                    Give Oreo <strong className="text-paper/90">View Channel</strong>, <strong className="text-paper/90">Send Messages</strong> and{" "}
                    <strong className="text-paper/90">Embed Links</strong> there (Edit channel → Permissions), then refresh the list.
                </Callout>
            )}

            {PLATFORM_CONTENT_TYPES[platform].length > 1 && (
                <div>
                    <p id={typesLabel} className="mb-2 text-sm font-medium text-paper">Announce</p>
                    <ContentTypePicker
                        value={draft.contentTypes}
                        onChange={(value) => set("contentTypes", value)}
                        options={PLATFORM_CONTENT_TYPES[platform]}
                        labelledBy={typesLabel}
                        error={errors.contentTypes}
                    />
                    {draft.contentTypes.includes("members") && (
                        <p className="mt-2 text-xs text-paper/65">
                            Members-only posts are announced for everyone in the channel to see. Only members can open the link. They are found for channels that offer memberships.
                        </p>
                    )}
                </div>
            )}

            <SwitchField
                label="Publish in announcement channels"
                description={
                    announcement
                        ? `Oreo publishes each post, so servers following #${channel!.name} get it too.`
                        : "Only applies when the channel above is an announcement channel."
                }
                checked={draft.publishPosts}
                disabled={!announcement}
                onChange={(value) => set("publishPosts", value)}
            />
        </SectionCard>
    );
}


export function roleOptions(resources: GuildResources | undefined, onlyAssignable: boolean): ComboOption[] {
    return (resources?.roles ?? []).map((role) => ({
        value: role.id,
        label: role.name,
        icon: <RoleDot color={role.color} />,
        disabled: onlyAssignable && !role.assignable,
        hint:
            onlyAssignable && role.dangerous
                ? "Has moderator permissions"
                : onlyAssignable && !role.assignable
                    ? "Oreo can't give it"
                    : role.managed
                        ? "Managed"
                        : undefined,
        description: role.managed ? "Managed by an integration" : undefined
    }));
}

type RoleChange = Partial<Pick<GuildCreator, "pingRoles" | "pingOverrides">>;

export function PingsSection({
    draft,
    set,
    setRoles,
    resources,
    errors,
    guildId,
    resourcesError,
    onRetryResources
}: SectionProps & { guildId: string, setRoles: (changes: RoleChange) => void }) {
    const pingLabel = useId();
    const liveLabel = useId();
    const userId = useId();
    const userHelp = useId();
    const name = draft.creator.displayName;

    const liveOptions = useMemo(() => roleOptions(resources, true), [resources]);
    const liveRole = draft.liveRoleId ? resources?.roles.find((role) => role.id === draft.liveRoleId) : undefined;
    const types = draft.contentTypes.filter((type) => PLATFORM_CONTENT_TYPES[draft.creator.platform].includes(type));

    const everyRole = allPingRoles(draft);
    const pingOptions = useMemo(
        () => roleOptions(resources, false).map((option) => {
            const role = resources?.roles.find((item) => item.id === option.value);
            return draft.notifyButton && role && !role.assignable ? { ...option, warn: true, hint: option.hint ?? "Oreo can't give it" } : option;
        }),
        [resources, draft.notifyButton]
    );
    const roleNames = everyRole.map((id) => resources?.roles.find((role) => role.id === id)?.name).filter((value): value is string => Boolean(value));
    const ungivable = draft.notifyButton ? everyRole.map((id) => resources?.roles.find((role) => role.id === id)).filter((role) => role && !role.assignable) : [];
    const silent = types.filter((type) => pingRolesFor(draft, type).length && !/\{role\.pingroles?\}/i.test(draft.messages[type === "members" ? "video" : type] ?? ""));

    const [lookupId, setLookupId] = useState(draft.liveUserId);
    useEffect(() => {
        const timer = window.setTimeout(() => setLookupId(draft.liveUserId), 400);
        return () => window.clearTimeout(timer);
    }, [draft.liveUserId]);
    const validId = lookupId && /^\d{17,20}$/.test(lookupId) ? lookupId : null;
    const member = useApi<{ id: string, username: string, globalName: string | null, avatarUrl: string }>(validId ? paths.user(guildId, validId) : null);

    return (
        <SectionCard
            id="pings"
            icon={<Bell className="size-5" />}
            title="Pings & roles"
            description="Who gets pinged, and a role that shows who's live."
        >
            <Field
                label="Ping roles"
                labelId={pingLabel}
                error={errors.pingRoles}
                description={
                    <>
                        Pinged by every kind of post that doesn&apos;t have roles of its own (set those under Message). Mentioned wherever the message has{" "}
                        <code className="font-mono text-cream-300/80">{"{role.pingrole}"}</code>. Up to {MAX_PING_ROLES}.
                    </>
                }
            >
                {resources ? (
                    <MultiCombobox
                        values={draft.pingRoles}
                        onChange={(pingRoles) => setRoles({ pingRoles })}
                        options={pingOptions}
                        max={MAX_PING_ROLES}
                        placeholder="No ping roles"
                        addLabel="Add role"
                        searchPlaceholder="Search roles"
                        missingLabel="Unknown role: it may have been deleted"
                        invalid={Boolean(errors.pingRoles)}
                        aria-labelledby={pingLabel}
                    />
                ) : (
                    <PickerFallback error={resourcesError} onRetry={onRetryResources} />
                )}
            </Field>

            {silent.length > 0 && (
                <Callout tone="info">
                    The {silent.map((type) => CONTENT_TYPE_NAMES[type].one.toLowerCase()).join(" and ")} message{silent.length === 1 ? "" : "s"} {silent.length === 1 ? "doesn't" : "don't"} include{" "}
                    <code className="font-mono text-cream-300/80">{"{role.pingrole}"}</code>, so {silent.length === 1 ? "its" : "their"} roles won&apos;t be pinged. Add it to the message below.
                </Callout>
            )}

            <SwitchField
                label="🔔 “Notify me” button"
                description={
                    everyRole.length
                        ? `Adds a button members press to give themselves the roles that post pings${roleNames.length ? ` (${roleNames.slice(0, 3).map((roleName) => `@${roleName}`).join(", ")}${roleNames.length > 3 ? ` +${roleNames.length - 3}` : ""})` : ""}. Only people who opted in get pinged.`
                        : "Lets members give themselves the ping roles. Add a ping role first."
                }
                checked={draft.notifyButton && everyRole.length > 0}
                disabled={!everyRole.length}
                onChange={(value) => set("notifyButton", value)}
            >
                {ungivable.length > 0 && (
                    <Callout tone="warning" className="mt-3">
                        Oreo can&apos;t give {ungivable.map((role) => `@${role!.name}`).join(", ")}: move Oreo&apos;s role above {ungivable.length === 1 ? "it" : "them"} and make sure Oreo has Manage Roles.
                    </Callout>
                )}
            </SwitchField>

            <div className="seam h-px" aria-hidden="true" />

            <div className="flex items-start gap-3.5">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-cream-400/20 bg-cream-500/10 text-cream-400" aria-hidden="true">
                    <Radio className="size-4" />
                </span>
                <div>
                    <p className="text-[0.95rem] font-medium text-paper">Live role</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-paper/65">
                        While {name} is live, Oreo gives a role to a member, usually {name}&apos;s own Discord account, so they stand out
                        in the member list. It&apos;s taken away when the stream ends.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Role to give" labelId={liveLabel} description="Only roles below Oreo's highest role can be given.">
                    {resources ? (
                        <Combobox
                            value={draft.liveRoleId}
                            onChange={(value) => set("liveRoleId", value)}
                            options={liveOptions}
                            clearOption={{ label: "No live role", icon: <BellOff className="size-4" /> }}
                            placeholder="No live role"
                            searchPlaceholder="Search roles"
                            missingLabel="Unknown role, it may have been deleted"
                            aria-labelledby={liveLabel}
                        />
                    ) : (
                        <PickerFallback error={resourcesError} onRetry={onRetryResources} />
                    )}
                </Field>

                <Field
                    label="Member's user id"
                    htmlFor={userId}
                    descriptionId={userHelp}
                    description="Developer Mode on, then right-click them → Copy User ID."
                    error={errors.liveUserId}
                >
                    <input
                        id={userId}
                        type="text"
                        inputMode="numeric"
                        value={draft.liveUserId ?? ""}
                        placeholder="222222222222222222"
                        autoComplete="off"
                        spellCheck={false}
                        aria-describedby={userHelp}
                        aria-invalid={Boolean(errors.liveUserId) || undefined}
                        onChange={(event) => {
                            const value = event.target.value.replace(/\s/g, "");
                            set("liveUserId", value ? value : null);
                        }}
                        className={cn(inputClasses, "h-11 font-mono text-sm")}
                    />
                </Field>
            </div>

            {validId && (
                <div aria-live="polite">
                    {member.loading || (member.validating && !member.data) ? (
                        <div className="flex items-center gap-3 rounded-xl border border-paper/8 bg-ink-900 p-3">
                            <Skeleton className="size-10 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    ) : member.data ? (
                        <div className="popover-in flex items-center gap-3 rounded-xl border border-cream-400/15 bg-cream-500/[0.06] p-3">
                            <Avatar src={member.data.avatarUrl} name={member.data.globalName ?? member.data.username} className="size-10 text-sm" />
                            <div className="min-w-0">
                                <p className="truncate font-medium text-paper">{member.data.globalName ?? member.data.username}</p>
                                <p className="truncate text-xs text-paper/60">@{member.data.username}</p>
                            </div>
                            {liveRole && (
                                <span className="ml-auto hidden items-center gap-1.5 text-xs text-paper/60 sm:flex">
                                    gets <RoleDot color={liveRole.color} /> <span className="font-medium text-paper/75">{liveRole.name}</span> while live
                                </span>
                            )}
                        </div>
                    ) : member.error ? (
                        <Callout tone="warning" icon={<UserRound className="size-4.5" />}>{member.error.message}</Callout>
                    ) : null}
                </div>
            )}

            {draft.liveRoleId && !draft.liveUserId && (
                <p className="flex items-center gap-2 text-sm text-warn">
                    <TriangleAlert className="size-4 shrink-0" />
                    Add the member who should get the role.
                </p>
            )}
            {draft.liveUserId && !draft.liveRoleId && !errors.liveUserId && (
                <p className="flex items-center gap-2 text-sm text-warn">
                    <TriangleAlert className="size-4 shrink-0" />
                    Pick the role to give them.
                </p>
            )}
        </SectionCard>
    );
}


export function MessageSection({
    draft,
    setMessage,
    setRoles,
    resources,
    errors,
    type,
    onTypeChange,
    onReset
}: {
    draft: GuildCreator;
    setMessage: (type: ContentType, value: string) => void;
    setRoles: (changes: RoleChange) => void;
    resources: GuildResources | undefined;
    errors: Errors;
    type: ContentType;
    onTypeChange: (type: ContentType) => void;
    onReset: () => void;
}) {
    const idBase = useId();
    const types = PLATFORM_CONTENT_TYPES[draft.creator.platform];
    const ids = tabIds(idBase, type);
    const value = draft.messages[type === "members" ? "video" : type] ?? "";

    return (
        <SectionCard
            id="message"
            icon={<MessageSquareText className="size-5" />}
            title="Message"
            description="The text posted above the embed."
            aside={
                <Button variant="subtle" size="xs" onClick={onReset}>
                    <RotateCcw className="size-3.5" />
                    Reset
                </Button>
            }
        >
            {types.length > 1 && (
                <Tabs
                    idBase={idBase}
                    label="Message for"
                    value={type}
                    onChange={onTypeChange}
                    items={types.map((item) => ({
                        value: item,
                        label: CONTENT_TYPE_NAMES[item].one,
                        icon: contentIcon(item, "size-3.5"),
                        badge: !draft.contentTypes.includes(item) ? (
                            <span className="rounded bg-ink-600 px-1 py-px text-[0.6rem] font-semibold uppercase text-paper/65">off</span>
                        ) : errors[`messages.${item}`] ? (
                            <span className="size-1.5 rounded-full bg-bad" aria-label="has an error" />
                        ) : undefined
                    }))}
                />
            )}

            <div {...(types.length > 1 ? { role: "tabpanel", id: ids.panel, "aria-labelledby": ids.tab } : {})}>
                {type === "members" ? (
                    <Callout tone="info">Members-only posts use the Video message.</Callout>
                ) : (
                    <TemplateField
                        key={type}
                        label={`${CONTENT_TYPE_NAMES[type].one} message`}
                        value={value}
                        onChange={(next) => setMessage(type, next)}
                        placeholders={PLACEHOLDERS}
                        max={LIMITS.message}
                        multiline
                        rows={5}
                        placeholder="Leave empty to post only the embed"
                        error={errors[`messages.${type}`]}
                        description={
                            <>
                                Discord markdown works, like <span className="font-mono">**bold**</span>, <span className="font-mono">*italic*</span>,{" "}
                                <span className="font-mono"># heading</span>, <span className="font-mono">[link](https://…)</span>. Leave it empty to post only the embed.
                            </>
                        }
                    />
                )}
            </div>

            <KindPings key={type} draft={draft} type={type} resources={resources} setRoles={setRoles} error={errors[`pingOverrides.${type}`]} />

            {!value.trim() && !draft.embed.enabled && (
                <Callout tone="info">With the embed off as well, Oreo posts a short default line instead of an empty message.</Callout>
            )}
        </SectionCard>
    );
}


function KindPings({
    draft,
    type,
    resources,
    setRoles,
    error
}: {
    draft: GuildCreator;
    type: ContentType;
    resources: GuildResources | undefined;
    setRoles: (changes: RoleChange) => void;
    error?: string;
}) {
    const labelId = useId();
    const pickerId = useId();
    const options = useMemo(() => roleOptions(resources, false), [resources]);
    const override = draft.pingOverrides[type];
    const [choosing, setChoosing] = useState(false);
    const mode: "default" | "custom" | "none" = override === undefined ? (choosing ? "custom" : "default") : override.length ? "custom" : "none";
    const kind = CONTENT_TYPE_NAMES[type].one.toLowerCase();

    const setOverride = (next: string[] | undefined) => {
        const overrides: PingOverrides = { ...draft.pingOverrides };
        if (next === undefined) delete overrides[type];
        else overrides[type] = next;
        setRoles({ pingOverrides: overrides });
    };
    const choose = (next: "default" | "custom" | "none") => {
        setChoosing(next === "custom");
        if (next === "default") setOverride(undefined);
        else if (next === "none") setOverride([]);
        else if (override !== undefined && !override.length) setOverride(undefined);
    };

    const effective = pingRolesFor(draft, type)
        .map((id) => resources?.roles.find((role) => role.id === id)?.name)
        .filter((value): value is string => Boolean(value));

    return (
        <div className="space-y-3 rounded-xl border border-paper/[0.07] bg-ink-900 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p id={labelId} className="text-sm font-medium text-paper/85">Ping for {kind}s</p>
                <Segmented
                    size="sm"
                    labelledBy={labelId}
                    value={mode}
                    onChange={choose}
                    options={[
                        { value: "default", label: "Default roles" },
                        { value: "custom", label: "Specific roles" },
                        { value: "none", label: "No ping" }
                    ]}
                />
            </div>

            {mode === "custom" && (
                <div>
                    {resources ? (
                        <MultiCombobox
                            id={pickerId}
                            values={override ?? []}
                            onChange={(next) => setOverride(next.length ? next : undefined)}
                            options={options}
                            max={MAX_PING_ROLES}
                            placeholder="Pick the roles this kind of post pings"
                            addLabel="Add role"
                            searchPlaceholder="Search roles"
                            missingLabel="Unknown role: it may have been deleted"
                            invalid={Boolean(error)}
                            aria-labelledby={labelId}
                        />
                    ) : (
                        <p className="text-xs text-paper/60">The server&apos;s roles aren&apos;t loaded yet.</p>
                    )}
                    {error && <p className="mt-1.5 text-xs text-[var(--color-bad-300)]" role="alert">{error}</p>}
                </div>
            )}

            <p className="text-xs leading-relaxed text-paper/60" aria-live="polite">
                {mode === "none"
                    ? `${CONTENT_TYPE_NAMES[type].one} posts ping no one, even where the message has {role.pingrole}.`
                    : mode === "custom" && !override?.length
                        ? "Until you pick a role, the default roles are used."
                        : effective.length
                            ? `Pings ${effective.slice(0, 3).map((roleName) => `@${roleName}`).join(", ")}${effective.length > 3 ? ` +${effective.length - 3}` : ""}${mode === "default" ? " (the default roles)" : ""}.`
                            : mode === "default"
                                ? "No default roles are set, so nobody is pinged."
                                : ""}
            </p>
        </div>
    );
}


const PLAIN_PLACEHOLDERS = PLACEHOLDERS.filter((item) => item.plain);
const TEXT_PLACEHOLDERS = PLACEHOLDERS.filter((item) => item.group !== "Pings");

export function EmbedSection({
    draft,
    setEmbed,
    errors,
    onReset
}: {
    draft: GuildCreator;
    setEmbed: <K extends keyof EmbedConfig>(key: K, value: EmbedConfig[K]) => void;
    errors: Errors;
    onReset: () => void;
}) {
    const colorLabel = useId();
    const embed = draft.embed;

    return (
        <SectionCard
            id="embed"
            icon={<LayoutPanelTop className="size-5" />}
            title="Embed"
            description="The card under the message: title, image and details."
            aside={
                <Button variant="subtle" size="xs" onClick={onReset}>
                    <RotateCcw className="size-3.5" />
                    Reset
                </Button>
            }
        >
            <SwitchField
                label="Show the embed"
                description={embed.enabled ? "Posted under the message." : "Off: only the message text is posted."}
                checked={embed.enabled}
                onChange={(value) => setEmbed("enabled", value)}
            />

            {embed.enabled && (
                <div className="space-y-6">
                    <div>
                        <p id={colorLabel} className="mb-2 text-sm font-medium text-paper">Colour</p>
                        <ColorPicker
                            value={embed.color}
                            onChange={(value) => setEmbed("color", value)}
                            platform={draft.creator.platform}
                            labelledBy={colorLabel}
                            error={errors["embed.color"]}
                        />
                        <p className="mt-2 text-[0.8rem] text-paper/55">Ended streams always turn grey.</p>
                    </div>

                    <TemplateField
                        label="Author"
                        value={embed.author}
                        onChange={(value) => setEmbed("author", value)}
                        placeholders={PLAIN_PLACEHOLDERS}
                        max={LIMITS.author}
                        chips="focus"
                        error={errors["embed.author"]}
                    />
                    <ImageField
                        label="Author icon"
                        value={embed.authorIcon}
                        onChange={(value) => setEmbed("authorIcon", value)}
                        description="The little round picture beside the author."
                    />

                    <TemplateField
                        label="Title"
                        value={embed.title}
                        onChange={(value) => setEmbed("title", value)}
                        placeholders={TEXT_PLACEHOLDERS}
                        max={LIMITS.title}
                        chips="focus"
                        error={errors["embed.title"]}
                    />
                    <SwitchField
                        label="Link the title"
                        description="Clicking the title opens the stream or video, or the recording once a stream ends."
                        checked={embed.linkTitle}
                        onChange={(value) => setEmbed("linkTitle", value)}
                    />

                    <TemplateField
                        label="Description"
                        value={embed.description}
                        onChange={(value) => setEmbed("description", value)}
                        placeholders={PLACEHOLDERS}
                        max={LIMITS.description}
                        multiline
                        rows={3}
                        chips="focus"
                        error={errors["embed.description"]}
                    />

                    <ImageField
                        label="Thumbnail"
                        value={embed.thumbnail}
                        onChange={(value) => setEmbed("thumbnail", value)}
                        description="Small, in the top right corner."
                    />
                    <ImageField
                        label="Image"
                        value={embed.image}
                        onChange={(value) => setEmbed("image", value)}
                        description="Large, under the text."
                    />

                    <TemplateField
                        label="Footer"
                        value={embed.footer}
                        onChange={(value) => setEmbed("footer", value)}
                        placeholders={PLAIN_PLACEHOLDERS}
                        max={LIMITS.footer}
                        chips="focus"
                        error={errors["embed.footer"]}
                        description="Streams also get “Live now” or “Stream ended” here."
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <SwitchField
                            label="Timestamp"
                            description="When it went live or was posted, in each member's own timezone."
                            checked={embed.timestamp}
                            onChange={(value) => setEmbed("timestamp", value)}
                        />
                        <SwitchField
                            label="Show category"
                            description="Adds a “Playing” (streams) or “Category” field."
                            checked={embed.showCategory}
                            onChange={(value) => setEmbed("showCategory", value)}
                        />
                    </div>
                </div>
            )}
        </SectionCard>
    );
}


export function ButtonsSection({ draft, set }: Pick<SectionProps, "draft" | "set">) {
    return (
        <SectionCard
            id="buttons"
            icon={<MousePointerClick className="size-5" />}
            title="Buttons"
            description="Shown under the notification."
        >
            <SwitchField
                label="Watch button"
                description={`A “Watch Stream” or “Watch Video” button that goes straight to ${platformName(draft.creator.platform)}. Ended streams link to the recording.`}
                checked={draft.watchButton}
                onChange={(value) => set("watchButton", value)}
            />
            <p className="text-[0.8rem] text-paper/55">The 🔔 Notify me button is set up under Pings &amp; roles.</p>
        </SectionCard>
    );
}


const END_OPTIONS: { value: StreamEndAction, title: string, description: string }[] = [
    { value: "edit", title: "Update it", description: "The message turns grey, says how long the stream lasted, and links the recording." },
    { value: "delete", title: "Delete it", description: "Keeps the channel tidy: only live streams stay listed." },
    { value: "keep", title: "Leave it", description: "The message stays exactly as it was posted." }
];

export function StreamEndSection({ draft, set }: Pick<SectionProps, "draft" | "set">) {
    const labelId = useId();
    const streams = draft.contentTypes.includes("live");

    const onKey = (event: React.KeyboardEvent, index: number) => {
        const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = (index + step + END_OPTIONS.length) % END_OPTIONS.length;
        set("onStreamEnd", END_OPTIONS[next]!.value);
        (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
    };

    return (
        <SectionCard
            id="stream-end"
            icon={<Radio className="size-5" />}
            title="When the stream ends"
            description="What happens to the live notification afterwards."
        >
            {!streams && (
                <p className="rounded-xl border border-paper/8 bg-ink-900 px-3 py-2 text-[0.8rem] text-paper/65">
                    Livestreams are switched off above, so this only matters if you turn them back on.
                </p>
            )}
            <span id={labelId} className="sr-only">When the stream ends</span>
            <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {END_OPTIONS.map((option, index) => {
                    const checked = draft.onStreamEnd === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            tabIndex={checked ? 0 : -1}
                            onClick={() => set("onStreamEnd", option.value)}
                            onKeyDown={(event) => onKey(event, index)}
                            className={cn(
                                "flex flex-col gap-1 rounded-xl border p-3.5 text-left transition-all duration-200",
                                checked ? "border-cream-400/30 bg-cream-500/8" : "border-paper/8 bg-ink-900 hover:border-paper/18"
                            )}
                        >
                            <span className="flex items-center justify-between gap-2">
                                <span className={cn("text-sm font-semibold", checked ? "text-paper" : "text-paper/70")}>{option.title}</span>
                                <span
                                    className={cn("grid size-4 place-items-center rounded-full border", checked ? "border-cream-400 bg-cream-500" : "border-paper/25")}
                                    aria-hidden="true"
                                >
                                    {checked && <span className="size-1.5 rounded-full bg-ink-950" />}
                                </span>
                            </span>
                            <span className="text-xs leading-relaxed text-paper/60">{option.description}</span>
                        </button>
                    );
                })}
            </div>
        </SectionCard>
    );
}


export function DangerZone({ name, onRemove }: { name: string, onRemove: () => void }) {
    return (
        <SectionCard id="danger" tone="danger" icon={<Trash className="size-5" />} title="Danger zone">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium text-paper">Remove {name}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-paper/65">
                        Stops notifications in this server and deletes these settings and the notification history.
                    </p>
                </div>
                <Button variant="destructive" size="sm" onClick={onRemove} className="shrink-0">
                    <Trash className="size-4" />
                    Remove creator
                </Button>
            </div>
        </SectionCard>
    );
}

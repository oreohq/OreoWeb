"use client";

import { allPingRoles, type GuildCreator, type GuildLive, type GuildOverview, type GuildResources, type PlatformName } from "@/lib/api/types";
import { CONTENT_TYPE_NAMES, PLATFORM_CONTENT_TYPES, PLATFORM_ORDER, platformColor, platformName } from "@/lib/dashboard/platforms";
import { AtSign, ChevronRight, Hash, Megaphone, Plus, Search, TriangleAlert, Wifi, WifiOff } from "@/components/ui/glyphs";
import { AddCreatorDialog, useAddCreatorLink } from "@/components/dashboard/creators/add-creator";
import { EmptyState, PageHeader } from "@/components/dashboard/states";
import { CreatorAvatar } from "@/components/dashboard/avatars";
import { useToast } from "@/components/dashboard/toast";
import { PlatformIcon } from "@/components/ui/icons";
import { inputClasses } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, m } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";
import { mutate, useApi } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EASE_OUT, spring } from "@/lib/motion";
import { api, paths } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import Link from "next/link";
import cn from "@/lib/cn";


type Filter = "all" | PlatformName;

const COLUMNS = "md:grid md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_7.5rem_1.5rem] md:items-center md:gap-4";


export function CreatorsPage({ guildId }: { guildId: string }) {
    const overview = useApi<GuildOverview>(paths.guild(guildId));
    const resources = useApi<GuildResources>(paths.resources(guildId));
    const live = useApi<GuildLive>(paths.live(guildId));
    const [filter, setFilter] = useState<Filter>("all");
    const [query, setQuery] = useState("");
    const [adding, setAdding] = useState<{ platform?: PlatformName } | null>(null);

    useAddCreatorLink(() => setAdding({}));

    const liveIds = useMemo(() => new Set((live.data ?? []).map((entry) => entry.guildCreatorId)), [live.data]);

    const rows = useMemo(() => {
        const words = query.trim().toLowerCase();
        return (overview.data?.creators ?? [])
            .filter((item) => filter === "all" || item.creator.platform === filter)
            .filter((item) => !words || `${item.creator.displayName} ${item.creator.username}`.toLowerCase().includes(words))
            .sort(
                (a, b) =>
                    Number(liveIds.has(b.id)) - Number(liveIds.has(a.id)) ||
                    PLATFORM_ORDER.indexOf(a.creator.platform) - PLATFORM_ORDER.indexOf(b.creator.platform) ||
                    a.creator.displayName.localeCompare(b.creator.displayName)
            );
    }, [overview.data, filter, query, liveIds]);

    if (!overview.data) return <PageSkeleton />;

    const data = overview.data;
    const total = data.creators.length;
    const freeSlots = (filter === "all" ? PLATFORM_ORDER : [filter]).filter(
        (platform) => data.limits.slots[platform].used < data.limits.slots[platform].total
    );

    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <PageHeader
                title="Creators"
                description="Who Oreo watches for this server. Open one to fine-tune its message, embed, pings and roles."
                actions={
                    <Button variant="primary" size="lg" onClick={() => setAdding({})}>
                        <Plus />
                        Add creator
                    </Button>
                }
            />

            {total === 0 ? (
                <EmptyState
                    className="mt-8"
                    title="No creators yet"
                    description="Add a YouTube, Twitch or Kick channel and Oreo posts here the moment they go live or upload."
                    action={
                        <Button variant="primary" size="md" onClick={() => setAdding({})}>
                            <Plus />
                            Add your first creator
                        </Button>
                    }
                />
            ) : (
                <>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Tabs
                            idBase="creators-filter"
                            label="Filter by platform"
                            value={filter}
                            onChange={setFilter}
                            items={[
                                { value: "all", label: "All", badge: <Count>{total}</Count> },
                                ...PLATFORM_ORDER.map((platform) => ({
                                    value: platform,
                                    label: platformName(platform),
                                    icon: <PlatformIcon platform={platform} />,
                                    badge: <Count>{data.limits.slots[platform].used}/{data.limits.slots[platform].total}</Count>
                                }))
                            ]}
                        />
                        {total > 6 && (
                            <label className="relative block w-full sm:w-60">
                                <span className="sr-only">Search creators</span>
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/50" aria-hidden="true" />
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search creators"
                                    className={cn(inputClasses, "h-9 pl-9")}
                                />
                            </label>
                        )}
                    </div>

                    <div
                        id={`creators-filter-panel-${filter}`}
                        role="tabpanel"
                        aria-labelledby={`creators-filter-tab-${filter}`}
                        className="panel mt-3 overflow-hidden rounded-2xl"
                    >
                        <div className={cn("hidden border-b border-paper/[0.06] px-4 py-2.5 text-xs font-medium text-paper/55", COLUMNS)}>
                            <span>Creator</span>
                            <span>Posts in</span>
                            <span>Announces</span>
                            <span>Notifications</span>
                            <span />
                        </div>

                        <m.ul layout transition={spring.layout} className="divide-hairline">
                            <AnimatePresence initial={false} mode="popLayout">
                                {rows.map((item, index) => (
                                    <m.li
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT, delay: Math.min(index, 10) * 0.02 } }}
                                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                                        transition={spring.layout}
                                    >
                                        <CreatorRow guildId={guildId} item={item} resources={resources.data} live={liveIds.has(item.id)} />
                                    </m.li>
                                ))}
                            </AnimatePresence>
                        </m.ul>

                        {rows.length === 0 && (
                            <p className="px-4 py-10 text-center text-sm text-paper/55">
                                {query.trim() ? `No creator matches "${query.trim()}".` : `No ${filter === "all" ? "" : `${platformName(filter)} `}creators yet.`}
                            </p>
                        )}

                        {!query.trim() && freeSlots.length > 0 && (
                            <div className="flex flex-wrap gap-2 border-t border-paper/[0.06] p-3">
                                {freeSlots.map((platform) => {
                                    const slots = data.limits.slots[platform];
                                    return (
                                        <button
                                            key={platform}
                                            type="button"
                                            onClick={() => setAdding({ platform })}
                                            className="group flex items-center gap-2 rounded-lg border border-dashed border-paper/12 px-3 py-2 text-xs text-paper/65 transition-colors hover:border-paper/25 hover:bg-paper/[0.03] hover:text-paper"
                                        >
                                            <Plus className="size-3.5 transition-transform duration-200 group-hover:rotate-90" />
                                            Add a {platformName(platform)} creator
                                            <span className="text-paper/45">{slots.total - slots.used} free</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}

            <AddCreatorDialog
                open={adding !== null}
                onClose={() => setAdding(null)}
                guildId={guildId}
                overview={data}
                resources={resources.data}
                initialPlatform={adding?.platform ?? (filter === "all" ? undefined : filter)}
            />
        </div>
    );
}


function Count({ children }: { children: React.ReactNode }) {
    return <span className="rounded bg-paper/[0.07] px-1 text-[0.625rem] tabular-nums text-paper/65">{children}</span>;
}


function CreatorRow({
    guildId,
    item,
    resources,
    live
}: {
    guildId: string;
    item: GuildCreator;
    resources: GuildResources | undefined;
    live: boolean;
}) {
    const toast = useToast();
    const [pending, setPending] = useState(false);
    const { creator } = item;
    const href = `/dashboard/${guildId}/creators/${item.id}`;
    const channel = item.channelId ? resources?.channels.find((entry) => entry.id === item.channelId) : undefined;
    const roles = allPingRoles(item).map((id) => resources?.roles.find((entry) => entry.id === id)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const role = roles[0];
    const types = item.contentTypes.filter((type) => PLATFORM_CONTENT_TYPES[creator.platform].includes(type));

    const replace = (next: GuildCreator) =>
        mutate<GuildOverview>(paths.guild(guildId), (current) =>
            current && { ...current, creators: current.creators.map((entry) => (entry.id === next.id ? next : entry)) }
        );

    const toggle = async (enabled: boolean) => {
        setPending(true);
        replace({ ...item, enabled });
        try {
            replace(await api.patch<GuildCreator>(paths.creator(guildId, item.id), { enabled }));
            toast.success(enabled ? `${creator.displayName} is on` : `${creator.displayName} is paused`, {
                description: enabled ? "Oreo posts about them again." : "Settings are kept. Nothing is posted until you turn it back on."
            });
        } catch (error) {
            replace(item);
            toast.error(error, { title: `Couldn't ${enabled ? "turn on" : "pause"} ${creator.displayName}` });
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={cn("group relative flex flex-col gap-3 px-4 py-3 transition-colors duration-150 hover:bg-paper/[0.025]", COLUMNS)}>
            <div className="flex min-w-0 items-center gap-3">
                <CreatorAvatar
                    creator={creator}
                    className={cn("size-9 text-xs transition-[filter,opacity] duration-300", !item.enabled && "opacity-50 grayscale")}
                    badgeClassName="size-4 [&_svg]:size-2.5"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {/* The name is the row's link and its ::after stretches over the row, under the switch */}
                        <Link
                            href={href}
                            className="truncate text-sm font-semibold text-paper after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-cream-500"
                        >
                            {creator.displayName}
                        </Link>
                        {live && <Badge tone="live">LIVE</Badge>}
                        {creator.subscriptionStatus === "pending" && (
                            <Tooltip
                                focusable
                                label="Connecting"
                                content={`Oreo is still subscribing to ${creator.displayName}'s updates on ${platformName(creator.platform)}.`}
                            >
                                <Badge tone="warning" icon={<Wifi />} className="relative z-10">Connecting</Badge>
                            </Tooltip>
                        )}
                        {creator.subscriptionStatus === "failed" && (
                            <Tooltip
                                focusable
                                label="Not connected"
                                content={`Updates from ${platformName(creator.platform)} aren't coming through yet. Oreo keeps retrying on its own.`}
                            >
                                <Badge tone="danger" icon={<WifiOff />} className="relative z-10">Not connected</Badge>
                            </Tooltip>
                        )}
                    </div>
                    <p className="truncate text-xs text-paper/55">@{creator.username}</p>
                </div>
                <div className="relative z-10 md:hidden">
                    <Switch size="sm" checked={item.enabled} disabled={pending} onChange={toggle} aria-label={`Post notifications for ${creator.displayName}`} />
                </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 pl-12 text-xs md:contents">
                <span className="flex min-w-0 items-center gap-1 text-paper/65">
                    {!item.channelId ? (
                        <span className="flex items-center gap-1 text-warn"><TriangleAlert className="size-3.5" /> No channel</span>
                    ) : channel ? (
                        <>
                            {channel.type === "announcement" ? <Megaphone className="size-3.5 shrink-0 text-paper/50" /> : <Hash className="size-3.5 shrink-0 text-paper/50" />}
                            <span className="truncate">{channel.name}</span>
                            {!channel.canSend && (
                                <Tooltip focusable label="Can't post" content={`Oreo can't post in #${channel.name}. Check its permissions there.`}>
                                    <TriangleAlert className="relative z-10 size-3.5 shrink-0 text-warn" />
                                </Tooltip>
                            )}
                        </>
                    ) : resources ? (
                        <span className="flex items-center gap-1 text-warn"><TriangleAlert className="size-3.5" /> Channel not found</span>
                    ) : (
                        <Skeleton className="h-3 w-20" />
                    )}
                </span>

                <span className="flex min-w-0 items-center gap-2 text-paper/65">
                    <span className="truncate">
                        {types.length === PLATFORM_CONTENT_TYPES[creator.platform].length && types.length > 1
                            ? "Everything"
                            : types.length > 1 && types.length === PLATFORM_CONTENT_TYPES[creator.platform].length - 1 && !types.includes("members")
                                ? "Everything public"
                                : types.map((type) => CONTENT_TYPE_NAMES[type].many).join(", ")}
                    </span>
                    {role && (
                        <span className="flex shrink-0 items-center gap-0.5 text-paper/75">
                            <AtSign className="size-3" style={{ color: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : undefined }} />
                            <span className="max-w-24 truncate">{role.name}</span>
                            {roles.length > 1 && <span className="text-paper/55" title={roles.map((entry) => entry.name).join(", ")}>+{roles.length - 1}</span>}
                        </span>
                    )}
                </span>

                <span className="relative z-10 hidden items-center gap-2 md:flex">
                    <Switch size="sm" checked={item.enabled} disabled={pending} onChange={toggle} aria-label={`Post notifications for ${creator.displayName}`} />
                    <span className={cn("text-xs", item.enabled ? "text-paper/75" : "text-paper/50")}>{item.enabled ? "On" : "Paused"}</span>
                </span>

                <ChevronRight
                    className="hidden size-4 text-paper/40 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-paper/70 md:block"
                    aria-hidden="true"
                />
            </div>
            <span className="sr-only">{platformName(creator.platform)}</span>
            <span className="pointer-events-none absolute inset-y-3 left-0 w-0.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: platformColor(creator.platform) }} aria-hidden="true" />
        </div>
    );
}


function PageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8" aria-busy="true" aria-label="Loading creators">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            <Skeleton className="mt-8 h-9 w-96 max-w-full rounded-xl" />
            <div className="panel mt-3 divide-hairline rounded-2xl">
                {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-3.5">
                        <Skeleton className="size-9 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-9 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

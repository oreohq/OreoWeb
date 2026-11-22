"use client";

import { ChevronRight, Crown, LoaderCircle, Plus, RefreshCw, Search } from "@/components/ui/glyphs";
import { EmptyState, ErrorState, PageHeader } from "@/components/dashboard/states";
import type { DashboardGuild, SessionUser } from "@/lib/api/types";
import { GuildIcon } from "@/components/dashboard/avatars";
import { useToast } from "@/components/dashboard/toast";
import { guildInviteUrl, redirects } from "@/lib/urls";
import { inputClasses } from "@/components/ui/field";
import { DiscordIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { paths } from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { EASE_OUT } from "@/lib/motion";
import { m } from "motion/react";
import Link from "next/link";
import cn from "@/lib/cn";


const STAGGER_LIMIT = 16;

export function ServersPage() {
    const me = useApi<SessionUser>(paths.me);
    const guilds = useApi<DashboardGuild[]>(paths.guilds);
    const toast = useToast();
    const [query, setQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [invited, setInvited] = useState<Set<string>>(new Set());

    const refresh = async () => {
        setRefreshing(true);
        try {
            await guilds.reload(`${paths.guilds}?refresh=true`);
            toast.success("Server list reloaded");
        } catch (error) {
            toast.error(error, { title: "Couldn't reload your servers" });
        } finally {
            setRefreshing(false);
        }
    };

    const list = useMemo(() => {
        const words = query.trim().toLowerCase();
        return (guilds.data ?? []).filter((guild) => !words || guild.name.toLowerCase().includes(words));
    }, [guilds.data, query]);

    const ready = list.filter((guild) => guild.botPresent);
    const invite = list.filter((guild) => !guild.botPresent);
    const total = guilds.data?.length ?? 0;
    const name = me.data?.globalName ?? me.data?.username;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-8 sm:pt-12">
            <PageHeader
                title={name ? `${name}'s servers` : me.loading ? <Skeleton className="h-7 w-56" /> : "Your servers"}
                description="Servers where you can manage Oreo. Pick one, or add Oreo to another."
                actions={
                    <>
                        <Button variant="discord" size="lg" href={redirects.invite} external>
                            <DiscordIcon />
                            Add to Discord
                        </Button>
                        <Button variant="secondary" size="lg" onClick={refresh} disabled={refreshing || guilds.loading}>
                            <RefreshCw className={cn(refreshing && "animate-spin")} />
                            Reload servers
                        </Button>
                    </>
                }
            />

            <div className="mt-7 border-t border-paper/[0.06] pt-7" aria-busy={guilds.loading}>
                {guilds.loading && <CardsSkeleton />}

                {!guilds.data && guilds.error && (
                    <ErrorState error={guilds.error} title="Couldn't load your servers" onRetry={() => guilds.reload()} />
                )}

                {guilds.data && total === 0 && (
                    <EmptyState
                        title="No servers to manage yet"
                        description="Oreo lists the servers you own or have the Manage Server permission in. Create one, or ask an admin for that permission, then reload."
                        action={
                            <>
                                <Button variant="discord" href={redirects.invite} external size="md">
                                    <DiscordIcon />
                                    Add to Discord
                                </Button>
                                <Button variant="secondary" size="md" onClick={refresh} disabled={refreshing}>
                                    <RefreshCw className={cn(refreshing && "animate-spin")} />
                                    Reload
                                </Button>
                            </>
                        }
                    />
                )}

                {guilds.data && total > 0 && (
                    <>
                        {total > 8 && (
                            <label className="relative mb-6 block w-full sm:w-72">
                                <span className="sr-only">Search servers</span>
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/50" aria-hidden="true" />
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={`Search ${total} servers`}
                                    className={cn(inputClasses, "h-10 pl-9")}
                                />
                            </label>
                        )}

                        {list.length === 0 && (
                            <EmptyState compact title="No servers match" description={`Nothing called "${query.trim()}". Try another name.`} />
                        )}

                        {ready.length > 0 && (
                            <section aria-labelledby="ready-heading">
                                <GroupHeading id="ready-heading" count={ready.length}>With Oreo</GroupHeading>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {ready.map((guild, index) => (
                                        <Appear key={guild.id} index={index}>
                                            <ManageCard guild={guild} />
                                        </Appear>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {invite.length > 0 && (
                            <section aria-labelledby="invite-heading" className={cn(ready.length > 0 && "mt-10")}>
                                <GroupHeading id="invite-heading" count={invite.length}>Add Oreo</GroupHeading>
                                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {invite.map((guild, index) => (
                                        <Appear key={guild.id} index={ready.length + index}>
                                            <InviteCard
                                                guild={guild}
                                                invited={invited.has(guild.id)}
                                                onInvite={() => setInvited((set) => new Set(set).add(guild.id))}
                                                onRefresh={refresh}
                                                refreshing={refreshing}
                                            />
                                        </Appear>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


function Appear({ index, children }: { index: number, children: React.ReactNode }) {
    return (
        <m.li
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: EASE_OUT, delay: Math.min(index, STAGGER_LIMIT) * 0.025 }}
        >
            {children}
        </m.li>
    );
}


function GroupHeading({ id, count, children }: { id: string, count: number, children: React.ReactNode }) {
    return (
        <h2 id={id} className="mb-3 flex items-center gap-2 text-sm font-medium text-paper/65">
            {children}
            <span className="rounded-md bg-paper/[0.06] px-1.5 py-px text-xs tabular-nums text-paper/65">{count}</span>
        </h2>
    );
}


function ManageCard({ guild }: { guild: DashboardGuild }) {
    return (
        <Link
            href={`/dashboard/${guild.id}`}
            className="panel group relative flex flex-col overflow-hidden rounded-2xl transition-[border-color,transform,box-shadow] duration-200 ease-snappy hover:-translate-y-0.5 hover:border-cream-500/35"
        >
            <span className="relative block h-16 overflow-hidden bg-cream-500/15" aria-hidden="true">
                {guild.iconUrl && (
                    <img src={guild.iconUrl} alt="" className="absolute inset-0 size-full scale-150 object-cover opacity-75 blur-2xl saturate-150" />
                )}
            </span>
            <span className="relative -mt-7 flex items-end gap-3 px-4 pb-4">
                <GuildIcon
                    name={guild.name}
                    iconUrl={guild.iconUrl}
                    className="size-14 text-sm ring-4 ring-ink-850 transition-transform duration-300 ease-out-quint group-hover:scale-[1.05]"
                />
                <span className="min-w-0 flex-1 pb-0.5">
                    <span className="flex items-center gap-1.5">
                        <span className="truncate text-[0.9375rem] font-semibold text-paper" title={guild.name}>{guild.name}</span>
                        {guild.premium && <Crown className="size-3.5 shrink-0 text-cream-400" aria-label="Premium" />}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-paper/60">
                        {guild.owner ? "Owner" : "Manage Server"}
                    </span>
                </span>
                <span
                    className="mb-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-paper/[0.05] text-paper/55 transition-colors duration-200 group-hover:bg-cream-500 group-hover:text-cream-900"
                    aria-hidden="true"
                >
                    <ChevronRight className="size-4" />
                </span>
            </span>
        </Link>
    );
}


function InviteCard({
    guild,
    invited,
    onInvite,
    onRefresh,
    refreshing
}: {
    guild: DashboardGuild;
    invited: boolean;
    onInvite: () => void;
    onRefresh: () => void;
    refreshing: boolean;
}) {
    return (
        <div className="group flex h-[4.75rem] items-center gap-3.5 rounded-2xl border border-paper/[0.06] bg-ink-900 px-3.5 transition-colors duration-150 hover:border-paper/10">
            <GuildIcon
                name={guild.name}
                iconUrl={guild.iconUrl}
                className="size-12 text-sm"
            />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.9375rem] font-medium text-paper" title={guild.name}>{guild.name}</span>
                {invited ? (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="mt-0.5 flex items-center gap-1 text-xs font-medium text-cream-400 hover:text-cream-300 disabled:opacity-60"
                    >
                        {refreshing ? <LoaderCircle className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                        Added it? Reload
                    </button>
                ) : (
                    <span className="mt-0.5 block text-xs text-paper/50">Oreo isn&apos;t here yet</span>
                )}
            </span>
            <a
                href={guildInviteUrl(guild.id)}
                target="_blank"
                rel="noreferrer"
                onClick={onInvite}
                className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-paper/10 bg-ink-800 px-2.5 text-xs font-medium text-paper/85 transition-colors hover:border-paper/16 hover:bg-ink-750 hover:text-paper"
            >
                <Plus className="size-3.5" />
                Add
                <span className="sr-only">Oreo to {guild.name} (opens Discord in a new tab)</span>
            </a>
        </div>
    );
}


function CardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="panel flex h-[4.75rem] items-center gap-3.5 rounded-2xl px-3.5">
                    <Skeleton className="size-12 rounded-[26%]" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-2.5 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

"use client";

import type { DashboardGuild, Delivery, GuildActivity, GuildLive, GuildOverview, GuildResources, PlatformName } from "@/lib/api/types";
import { AddCreatorDialog, useAddCreatorLink } from "@/components/dashboard/creators/add-creator";
import { BarChart3, Crown, History, Plus, RefreshCw } from "@/components/ui/glyphs";
import { HealthCard, SetupSteps } from "@/components/dashboard/overview/health";
import { Kpis, PlatformLegend } from "@/components/dashboard/overview/stats";
import { DeliveryRow } from "@/components/dashboard/activity/delivery-row";
import { ActivityChart } from "@/components/dashboard/overview/chart";
import { LiveNowCard } from "@/components/dashboard/overview/live";
import { GuildIcon } from "@/components/dashboard/avatars";
import { PageHeader } from "@/components/dashboard/states";
import { FadeIn } from "@/components/motion/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/dashboard/format";
import { Callout } from "@/components/ui/callout";
import { useNow } from "@/lib/dashboard/use-now";
import { Button } from "@/components/ui/button";
import { premiumEnabled } from "@/lib/premium";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { paths } from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";


export function OverviewPage({ guildId }: { guildId: string }) {
    const overview = useApi<GuildOverview>(paths.guild(guildId));
    const resources = useApi<GuildResources>(paths.resources(guildId));
    const guilds = useApi<DashboardGuild[]>(paths.guilds);
    const activity = useApi<GuildActivity>(paths.activity(guildId));
    const live = useApi<GuildLive>(paths.live(guildId));
    const deliveries = useApi<Delivery[]>(paths.deliveries(guildId, 6));
    const [adding, setAdding] = useState<{ platform?: PlatformName } | null>(null);
    const now = useNow();

    useAddCreatorLink(() => setAdding({}));

    const guild = guilds.data?.find((item) => item.id === guildId);
    const name = guild?.name ?? resources.data?.guild.name ?? "Server";
    const iconUrl = guild?.iconUrl ?? resources.data?.guild.iconUrl ?? null;

    useEffect(() => {
        if (guild?.name || resources.data?.guild.name) document.title = `${name} · Oreo Dashboard`;
    }, [guild?.name, resources.data?.guild.name, name]);

    if (!overview.data) return <OverviewSkeleton />;

    const data = overview.data;
    const limits = data.limits;
    // An API that doesn't have these yet, or fails, shouldn't hold the page up
    const activityData = activity.data ?? (activity.error ? null : undefined);
    const liveData = live.data ?? (live.error ? null : undefined);
    const channelName = (id: string | null) => (id ? resources.data?.channels.find((channel) => channel.id === id)?.name : undefined);

    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <PageHeader
                leading={<GuildIcon name={name} iconUrl={iconUrl} className="size-12 text-base" />}
                title={name}
                meta={
                    limits.premium ? (
                        <Badge tone="cream" icon={<Crown />}>
                            Premium{limits.premiumUntil ? ` until ${formatDate(limits.premiumUntil)}` : ""}
                        </Badge>
                    ) : premiumEnabled ? (
                        <Badge>Free plan</Badge>
                    ) : null
                }
                description={`${data.creators.length} ${data.creators.length === 1 ? "creator" : "creators"} · ${data.counters.length} ${data.counters.length === 1 ? "counter" : "counters"}`}
                actions={
                    <Button variant="primary" size="lg" onClick={() => setAdding({})}>
                        <Plus />
                        Add creator
                    </Button>
                }
            />

            <div className="mt-6 space-y-3 empty:hidden">
                <SetupSteps guildId={guildId} overview={data} deliveries={deliveries.data} onAdd={() => setAdding({})} />
                {!resources.data && resources.error && (
                    <Callout
                        tone="danger"
                        title="Couldn't load this server's channels and roles"
                        action={
                            <Button variant="secondary" size="xs" onClick={() => resources.reload().catch(() => null)}>
                                <RefreshCw />
                                Retry
                            </Button>
                        }
                    >
                        {resources.error.message} Channel and role names are missing until it loads.
                    </Callout>
                )}
            </div>

            <FadeIn className="mt-6">
                <Kpis overview={data} activity={activityData} />
            </FadeIn>

            <FadeIn className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3" delay={0.05}>
                <section className="panel rounded-2xl p-5 xl:col-span-2" aria-labelledby="chart-heading">
                    <header className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="icon-chip size-8 [&_svg]:size-4" aria-hidden="true"><BarChart3 /></span>
                            <div>
                                <h2 id="chart-heading" className="font-display text-xl leading-tight text-paper">Notifications</h2>
                                <p className="mt-0.5 text-sm text-paper/65">Last 30 days</p>
                            </div>
                        </div>
                        <PlatformLegend overview={data} />
                    </header>
                    {activityData ? (
                        <ActivityChart days={activityData.days} />
                    ) : activityData === null ? (
                        <p className="grid h-52 place-items-center text-sm text-paper/55">The chart isn&apos;t available right now.</p>
                    ) : (
                        <Skeleton className="h-52 w-full rounded-xl" />
                    )}
                </section>

                <LiveNowCard guildId={guildId} live={liveData} creators={data.creators} />
            </FadeIn>

            <FadeIn className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3" delay={0.1}>
                <section className="panel flex flex-col rounded-2xl xl:col-span-2" aria-labelledby="recent-heading">
                    <header className="flex items-center justify-between px-5 pb-2 pt-5">
                        <h2 id="recent-heading" className="flex items-center gap-2.5 font-display text-xl leading-tight text-paper">
                            <span className="icon-chip size-8 [&_svg]:size-4" aria-hidden="true"><History /></span>
                            Recent activity
                        </h2>
                    </header>
                    {deliveries.loading && (
                        <div className="space-y-3 p-4" aria-hidden="true">
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Skeleton className="size-4 rounded-full" />
                                    <Skeleton className="h-3.5 flex-1" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            ))}
                        </div>
                    )}
                    {deliveries.data && deliveries.data.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
                            <span className="icon-chip size-12 rounded-2xl [&_svg]:size-5" aria-hidden="true"><History /></span>
                            <p className="mt-3 text-sm font-medium text-paper/85">Nothing posted yet</p>
                            <p className="mt-1 max-w-72 text-sm leading-relaxed text-paper/65">Notifications show up here as creators go live or upload.</p>
                        </div>
                    )}
                    {!deliveries.data && deliveries.error && (
                        <p className="px-4 py-10 text-center text-sm text-paper/55">{deliveries.error.message}</p>
                    )}
                    {deliveries.data && deliveries.data.length > 0 && (
                        <ol className="divide-hairline py-1">
                            {deliveries.data.map((delivery) => (
                                <li key={delivery.id}>
                                    <DeliveryRow delivery={delivery} guildId={guildId} channelName={channelName(delivery.channelId)} now={now} compact />
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <HealthCard guildId={guildId} overview={data} resources={resources.data} />
            </FadeIn>

            <AddCreatorDialog
                open={adding !== null}
                onClose={() => setAdding(null)}
                guildId={guildId}
                overview={data}
                resources={resources.data}
                initialPlatform={adding?.platform}
            />
        </div>
    );
}


function OverviewSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8" aria-busy="true" aria-label="Loading server">
            <div className="flex items-center gap-3.5">
                <Skeleton className="size-12 rounded-[26%]" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-3.5 w-32" />
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="panel rounded-2xl p-4">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="mt-4 h-7 w-20" />
                        <Skeleton className="mt-3 h-3 w-28" />
                    </div>
                ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-3">
                <div className="panel h-72 rounded-2xl p-4 xl:col-span-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-6 h-52 w-full rounded-xl" />
                </div>
                <div className="panel h-72 rounded-2xl p-4">
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}


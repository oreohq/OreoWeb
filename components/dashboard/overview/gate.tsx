"use client";

import { ArrowLeft, LoaderCircle, Lock, Plus, RefreshCw } from "@/components/ui/glyphs";
import type { DashboardGuild, GuildOverview } from "@/lib/api/types";
import { ErrorState } from "@/components/dashboard/states";
import { GuildIcon } from "@/components/dashboard/avatars";
import { useToast } from "@/components/dashboard/toast";
import { FadeIn } from "@/components/motion/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { guildInviteUrl } from "@/lib/urls";
import { paths } from "@/lib/api/client";
import { useApi } from "@/lib/api/hooks";
import { useState } from "react";


const SNOWFLAKE = /^\d{17,20}$/;

export function GuildGate({ guildId, children }: { guildId: string, children: React.ReactNode }) {
    const valid = SNOWFLAKE.test(guildId);
    const overview = useApi<GuildOverview>(valid ? paths.guild(guildId) : null);
    const guilds = useApi<DashboardGuild[]>(paths.guilds);
    const guild = guilds.data?.find((item) => item.id === guildId);

    if (!valid) {
        return (
            <Blocked
                icon={<Lock className="size-6" />}
                title="That isn't a server link"
                description="The address doesn't point to a Discord server. Pick one from your list instead."
            />
        );
    }

    if (!overview.data && overview.error) {
        if (overview.error.code === "bot_missing") return <BotMissing guildId={guildId} guild={guild} onCheck={() => overview.reload()} />;
        if (overview.error.status === 403) {
            return (
                <Blocked
                    icon={<Lock className="size-6" />}
                    guild={guild}
                    title="You can't manage this server"
                    description={overview.error.message || "You need the Manage Server permission here. Ask an admin, or pick another server."}
                />
            );
        }
        return (
            <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
                <ErrorState error={overview.error} title="Couldn't load this server" onRetry={() => overview.reload()} />
            </div>
        );
    }

    // Pages below don't mount until then, so nothing is requested for a server the user can't manage
    if (!overview.data) return <GateLoading />;

    return <>{children}</>;
}


function GateLoading() {
    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8" aria-busy="true" aria-label="Loading server">
            <div className="flex items-center gap-3.5">
                <Skeleton className="size-12 rounded-[26%]" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-3.5 w-32" />
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="panel rounded-2xl p-4">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="mt-4 h-7 w-20" />
                    </div>
                ))}
            </div>
            <Skeleton className="mt-3 h-64 w-full rounded-2xl" />
        </div>
    );
}


function Blocked({
    icon,
    title,
    description,
    guild,
    children
}: {
    icon: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    guild?: DashboardGuild;
    children?: React.ReactNode;
}) {
    return (
        <div className="mx-auto grid min-h-[70svh] w-full max-w-lg place-items-center px-4 py-16 sm:px-6">
            <FadeIn className="panel w-full rounded-[1.25rem] px-6 py-10 text-center sm:px-10">
                <div className="mx-auto w-fit">
                    {guild ? (
                        <GuildIcon name={guild.name} iconUrl={guild.iconUrl} className="size-16 text-xl" />
                    ) : (
                        <span className="grid size-14 place-items-center rounded-2xl border border-paper/10 bg-ink-800 text-paper/75 [&_svg]:size-6">{icon}</span>
                    )}
                </div>
                <h1 className="mt-5 font-display text-2xl tracking-tight text-paper">{title}</h1>
                <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-paper/70">{description}</p>
                <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                    {children}
                    <Button href="/dashboard" variant={children ? "subtle" : "secondary"} size="lg">
                        <ArrowLeft />
                        Your servers
                    </Button>
                </div>
            </FadeIn>
        </div>
    );
}


function BotMissing({ guildId, guild, onCheck }: { guildId: string, guild?: DashboardGuild, onCheck: () => Promise<void> }) {
    const toast = useToast();
    const [checking, setChecking] = useState(false);

    const check = async () => {
        setChecking(true);
        try {
            await onCheck();
        } catch (error) {
            toast.info("Oreo still isn't there", {
                description: (error as { code?: string }).code === "bot_missing"
                    ? "Finish the invite in Discord, then check again. It can take a few seconds to show up."
                    : undefined
            });
        } finally {
            setChecking(false);
        }
    };

    return (
        <Blocked
            icon={<Plus className="size-6" />}
            guild={guild}
            title={guild ? <>Oreo isn&apos;t in {guild.name} yet</> : "Oreo isn't in this server yet"}
            description="Invite Oreo to start posting notifications here. Once it has joined, come back and check again."
        >
            <Button variant="primary" href={guildInviteUrl(guildId)} external size="lg">
                <Plus />
                Invite Oreo
            </Button>
            <Button variant="secondary" size="lg" onClick={check} disabled={checking}>
                {checking ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
                Check again
            </Button>
        </Blocked>
    );
}

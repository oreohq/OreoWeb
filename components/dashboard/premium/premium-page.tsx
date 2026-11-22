"use client";

import { CalendarClock, Crown, ExternalLink, LoaderCircle, Lock, Plus, Receipt, RefreshCw, Server } from "@/components/ui/glyphs";
import type { DashboardGuild, PremiumAssignmentSummary, PremiumGrantSummary, PremiumSummary } from "@/lib/api/types";
import { EmptyState, ErrorState, PageHeader } from "@/components/dashboard/states";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, timeAgo } from "@/lib/dashboard/format";
import { GuildIcon } from "@/components/dashboard/avatars";
import { useToast } from "@/components/dashboard/toast";
import { revalidate, useApi } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { useNow } from "@/lib/dashboard/use-now";
import { Button } from "@/components/ui/button";
import { EASE_OUT, spring } from "@/lib/motion";
import { api, paths } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { ClaimDialog } from "./claim-dialog";
import { useMemo, useState } from "react";
import { m } from "motion/react";
import Link from "next/link";
import cn from "@/lib/cn";


export function PremiumPage() {
    const premium = useApi<PremiumSummary>(paths.premium);
    const guilds = useApi<DashboardGuild[]>(paths.guilds);
    const [claiming, setClaiming] = useState(false);
    const data = premium.data;

    return (
        <div className="mx-auto w-full max-w-[60rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <PageHeader
                title="Premium"
                description="Premium belongs to you, not to a server. Get it on Ko-fi, then give it to the servers you manage."
                actions={
                    <>
                        <Button variant="secondary" size="lg" onClick={() => setClaiming(true)}>
                            <Receipt />
                            Claim a payment
                        </Button>
                        {data?.purchaseUrl && (
                            <Button variant="primary" size="lg" href={data.purchaseUrl} external>
                                <Crown />
                                Get premium
                            </Button>
                        )}
                    </>
                }
            />

            <div className="mt-7 border-t border-paper/[0.06] pt-7" aria-busy={premium.loading}>
                {premium.loading && <PageSkeleton />}
                {!data && premium.error && (
                    <ErrorState error={premium.error} title="Couldn't load your premium" onRetry={() => premium.reload()} />
                )}
                {data && (
                    <div className="space-y-10">
                        <Allowance premium={data} />
                        <Grants premium={data} onClaim={() => setClaiming(true)} />
                        <Servers premium={data} guilds={guilds.data} guildsLoading={guilds.loading} />
                        <HowItWorks />
                    </div>
                )}
            </div>

            <ClaimDialog open={claiming} onClose={() => setClaiming(false)} />
        </div>
    );
}


function Allowance({ premium }: { premium: PremiumSummary }) {
    const { used, total } = premium.servers;
    const now = useNow(60_000);
    const active = premium.grants.filter((grant) => grant.active);
    const renews = active.some((grant) => grant.renews);
    const nextEnd = active.length ? Math.min(...active.map((grant) => Date.parse(grant.expiresAt))) : null;
    const blocks = Math.max(total, used);

    return (
        <section aria-labelledby="allowance-heading" className="panel rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 id="allowance-heading" className="text-sm font-medium text-paper/65">Premium servers</h2>
                    <p className="mt-1 font-display text-[2.5rem] leading-none tabular-nums text-paper">
                        {used}
                        <span className="text-paper/45"> / {total}</span>
                    </p>
                </div>
                <p className="text-sm leading-relaxed text-paper/65 sm:text-right">
                    {total === 0 && "You don't have premium right now."}
                    {total > 0 && used < total && `${total - used} more server${total - used === 1 ? "" : "s"} can get premium.`}
                    {total > 0 && used >= total && "Every premium server is in use."}
                    {nextEnd && (
                        <span className="block text-paper/55">
                            {renews ? "Membership renews with each payment" : `Next change ${timeAgo(nextEnd, now)}`}
                        </span>
                    )}
                </p>
            </div>

            {blocks > 0 && (
                <ol className="mt-5 flex flex-wrap gap-1.5" aria-label={`${used} of ${total} premium servers in use`}>
                    {Array.from({ length: blocks }).map((_, index) => (
                        <m.li
                            key={index}
                            initial={{ opacity: 0, scaleX: 0.6 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ ...spring.smooth, delay: Math.min(index, 20) * 0.03 }}
                            className={cn(
                                "h-2 min-w-8 flex-1 basis-8 rounded-full",
                                index >= total ? "bg-bad/50" : index < used ? "bg-cream-500" : "bg-paper/[0.08]"
                            )}
                            title={index >= total ? "Over your allowance" : index < used ? "In use" : "Free"}
                        />
                    ))}
                </ol>
            )}
        </section>
    );
}


function Grants({ premium, onClaim }: { premium: PremiumSummary, onClaim: () => void }) {
    if (!premium.grants.length) {
        return (
            <section aria-labelledby="grants-heading">
                <SectionHeading id="grants-heading">Your premium</SectionHeading>
                <EmptyState
                    compact
                    icon={<Crown />}
                    title="No premium yet"
                    description="Buy a premium pass or join a membership on Ko-fi. If you connect Discord on Ko-fi, it shows up here by itself."
                    action={
                        <>
                            {premium.purchaseUrl && (
                                <Button variant="primary" size="md" href={premium.purchaseUrl} external>
                                    Open Ko-fi
                                    <ExternalLink />
                                </Button>
                            )}
                            <Button variant="secondary" size="md" onClick={onClaim}>
                                Paid already? Claim it
                            </Button>
                        </>
                    }
                />
            </section>
        );
    }

    return (
        <section aria-labelledby="grants-heading">
            <SectionHeading id="grants-heading" count={premium.grants.length}>Your premium</SectionHeading>
            <ul className="panel divide-hairline overflow-hidden rounded-2xl">
                {premium.grants.map((grant, index) => (
                    <Row key={grant.id} index={index}>
                        <GrantRow grant={grant} />
                    </Row>
                ))}
            </ul>
        </section>
    );
}

function GrantRow({ grant }: { grant: PremiumGrantSummary }) {
    const now = useNow(60_000);
    const ends = Date.parse(grant.expiresAt);
    const soon = grant.active && !grant.renews && ends - now < 5 * 86_400_000;

    return (
        <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-paper/8 bg-ink-800 text-cream-400 [&_svg]:size-[1.125rem]">
                {grant.renews ? <RefreshCw /> : <Crown />}
            </span>
            <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[0.9375rem] font-medium text-paper">
                    {grant.label}
                    {grant.active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Queued</Badge>}
                    {grant.renews && <Badge tone="cream">Monthly</Badge>}
                </p>
                <p className="mt-0.5 text-xs text-paper/60">
                    {grant.renews && `${grant.servers} server${grant.servers === 1 ? "" : "s"} · `}
                    {grant.active
                        ? grant.renews
                            ? `paid until ${formatDate(grant.expiresAt)}, extended by each payment`
                            : `Until ${formatDate(grant.expiresAt)}`
                        : `Starts ${formatDate(grant.startsAt)}, when your current premium ends`}
                </p>
            </div>
            <span className={cn("hidden shrink-0 text-xs tabular-nums sm:block", soon ? "text-warn" : "text-paper/55")}>
                {grant.active ? `ends ${timeAgo(ends, now)}` : `starts ${timeAgo(grant.startsAt, now)}`}
            </span>
        </div>
    );
}


interface ServerRow {
    guildId: string;
    guild: DashboardGuild | undefined;
    assignment: PremiumAssignmentSummary | undefined;
}

function Servers({ premium, guilds, guildsLoading }: { premium: PremiumSummary, guilds: DashboardGuild[] | undefined, guildsLoading: boolean }) {
    const toast = useToast();
    const premiumApi = useApi<PremiumSummary>(paths.premium);
    const [pending, setPending] = useState<string | null>(null);
    const [removing, setRemoving] = useState<ServerRow | null>(null);
    const free = premium.servers.total - premium.servers.used;

    const rows = useMemo<ServerRow[]>(() => {
        const assigned = new Map(premium.assignments.map((assignment) => [assignment.guildId, assignment]));
        const withBot = (guilds ?? []).filter((guild) => guild.botPresent);
        const list: ServerRow[] = premium.assignments.map((assignment) => ({
            guildId: assignment.guildId,
            assignment,
            guild: guilds?.find((guild) => guild.id === assignment.guildId)
        }));
        for (const guild of withBot) if (!assigned.has(guild.id)) list.push({ guildId: guild.id, guild, assignment: undefined });
        return list;
    }, [premium.assignments, guilds]);

    const settle = (guildId: string, summary: PremiumSummary) => {
        premiumApi.mutate(summary);
        void revalidate(paths.guild(guildId));
    };

    const give = async (row: ServerRow) => {
        setPending(row.guildId);
        try {
            settle(row.guildId, await api.put<PremiumSummary>(paths.guildPremium(row.guildId)));
            toast.success(`${row.guild?.name ?? "The server"} has premium`, { description: "Its limits went up right away." });
        } catch (error) {
            toast.error(error, { title: "Couldn't give premium" });
        } finally {
            setPending(null);
        }
    };

    const take = async () => {
        if (!removing) return;
        const row = removing;
        setPending(row.guildId);
        try {
            settle(row.guildId, await api.delete<PremiumSummary>(paths.premiumAssignment(row.guildId)));
            toast.success(`Premium taken off ${row.guild?.name ?? "the server"}`, { description: "You can give it to another server now." });
            setRemoving(null);
        } catch (error) {
            toast.error(error, { title: "Couldn't take premium back" });
        } finally {
            setPending(null);
        }
    };

    return (
        <section aria-labelledby="servers-heading">
            <SectionHeading id="servers-heading" count={rows.length}>Servers</SectionHeading>

            {guildsLoading && !rows.length && <RowsSkeleton />}
            {!guildsLoading && !rows.length && (
                <EmptyState
                    compact
                    icon={<Server />}
                    title="No servers with Oreo"
                    description="Premium goes to servers you manage that have Oreo. Add Oreo to one first."
                    action={<Button variant="secondary" size="md" href="/dashboard">Your servers</Button>}
                />
            )}

            {rows.length > 0 && (
                <ul className="panel divide-hairline overflow-hidden rounded-2xl">
                    {rows.map((row, index) => (
                        <Row key={row.guildId} index={index}>
                            <ServerItem
                                row={row}
                                free={free}
                                pending={pending === row.guildId}
                                busy={pending !== null}
                                onGive={() => give(row)}
                                onTake={() => setRemoving(row)}
                            />
                        </Row>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                open={removing !== null}
                onClose={() => setRemoving(null)}
                onConfirm={take}
                pending={pending !== null}
                icon={<Crown className="size-5" />}
                title={`Take premium off ${removing?.guild?.name ?? "this server"}?`}
                description="Its creators and counters keep working, but it can't add more past the free limits until it has premium again."
                confirmLabel="Take it back"
            />
        </section>
    );
}

function ServerItem({
    row,
    free,
    pending,
    busy,
    onGive,
    onTake
}: {
    row: ServerRow;
    free: number;
    pending: boolean;
    busy: boolean;
    onGive: () => void;
    onTake: () => void;
}) {
    const now = useNow(60_000);
    const { guild, assignment } = row;
    const name = guild?.name ?? "A server you're no longer in";
    const locked = assignment?.active && Date.parse(assignment.movableAt) > now;

    let status: React.ReactNode;
    const elsewhere = !assignment && Boolean(guild?.premium);
    if (elsewhere) status = <span className="text-paper/60">Premium from someone else{guild?.premiumUntil ? ` until ${formatDate(guild.premiumUntil)}` : ", no end date"}</span>;
    else if (!assignment) status = <span className="text-paper/55">Free plan</span>;
    else if (!assignment.active) status = <span className="text-warn">Paused: your premium doesn&apos;t cover this many servers</span>;
    else status = <span className="text-paper/60">Premium from you{assignment.premiumUntil ? ` until ${formatDate(assignment.premiumUntil)}` : ""}</span>;

    return (
        <div className="flex items-center gap-3.5 px-4 py-3 sm:px-5">
            {guild ? (
                <Link href={`/dashboard/${guild.id}`} className="shrink-0 rounded-[26%]" aria-label={`Open ${guild.name}`}>
                    <GuildIcon name={guild.name} iconUrl={guild.iconUrl} className="size-10 text-xs" />
                </Link>
            ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-[26%] bg-ink-700 text-paper/55 [&_svg]:size-4"><Server /></span>
            )}
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-[0.9375rem] font-medium text-paper">
                    <span className="truncate" title={name}>{name}</span>
                    {(assignment?.active || elsewhere) && <Badge tone="cream" icon={<Crown />}>Premium</Badge>}
                </p>
                <p className="mt-0.5 truncate text-xs">{status}</p>
            </div>

            {assignment ? (
                locked ? (
                    <Tooltip content={`Premium can move off a server a week after it was given: ${formatDate(assignment.movableAt)}.`}>
                        <span className="flex h-8 items-center gap-1.5 rounded-[0.625rem] px-2.5 text-sm text-paper/55">
                            <Lock className="size-3.5" />
                            <span className="hidden sm:inline">Movable {timeAgo(assignment.movableAt, now)}</span>
                        </span>
                    </Tooltip>
                ) : (
                    <Button variant="subtle" size="sm" onClick={onTake} disabled={busy}>
                        {pending && <LoaderCircle className="animate-spin" />}
                        Take back
                    </Button>
                )
            ) : elsewhere ? null : free > 0 ? (
                <Button variant="secondary" size="sm" onClick={onGive} disabled={busy}>
                    {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
                    Give premium
                </Button>
            ) : (
                <Tooltip content="All your premium servers are in use. Take one back, or get more on Ko-fi.">
                    <span className="flex h-8 items-center px-2.5 text-sm text-paper/45">No free server</span>
                </Tooltip>
            )}
        </div>
    );
}


function HowItWorks() {
    const points = [
        {
            icon: <Receipt />,
            title: "It finds you",
            text: "Connect Discord on Ko-fi and payments land here by themselves. Otherwise claim them with the receipt's transaction ID."
        },
        {
            icon: <Server />,
            title: "One server each",
            text: "Every premium server you have upgrades one server to 25 creators per platform and 10 counters. Buying again adds time."
        },
        {
            icon: <CalendarClock />,
            title: "Moves weekly",
            text: "Premium stays on a server for at least a week. If your premium runs short, the server you gave it to last pauses first."
        }
    ];

    return (
        <section aria-labelledby="how-heading">
            <SectionHeading id="how-heading">How premium works</SectionHeading>
            <ul className="grid gap-3 sm:grid-cols-3">
                {points.map((point) => (
                    <li key={point.title} className="rounded-2xl border border-paper/[0.06] bg-ink-900 p-4">
                        <span className="text-cream-400 [&_svg]:size-[1.125rem]">{point.icon}</span>
                        <p className="mt-2.5 text-[0.875rem] font-medium text-paper">{point.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-paper/60">{point.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}


function SectionHeading({ id, count, children }: { id: string, count?: number, children: React.ReactNode }) {
    return (
        <h2 id={id} className="mb-3 flex items-center gap-2 text-sm font-medium text-paper/65">
            {children}
            {count !== undefined && (
                <span className="rounded-md bg-paper/[0.06] px-1.5 py-px text-xs tabular-nums text-paper/65">{count}</span>
            )}
        </h2>
    );
}

function Row({ index, children }: { index: number, children: React.ReactNode }) {
    return (
        <m.li
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: Math.min(index, 12) * 0.03 }}
        >
            {children}
        </m.li>
    );
}

function RowsSkeleton() {
    return (
        <div className="panel divide-hairline overflow-hidden rounded-2xl" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3.5 px-5 py-3.5">
                    <Skeleton className="size-10 rounded-[26%]" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-1/3" />
                        <Skeleton className="h-2.5 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-10" aria-hidden="true">
            <div className="panel rounded-2xl p-6">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="mt-3 h-9 w-24" />
                <Skeleton className="mt-6 h-2 w-full" />
            </div>
            <RowsSkeleton />
        </div>
    );
}

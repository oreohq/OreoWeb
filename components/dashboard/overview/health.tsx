"use client";

import { ArrowRight, Check, CircleCheck, Radio, ShieldAlert, TriangleAlert, WifiOff } from "@/components/ui/glyphs";
import type { Delivery, GuildOverview, GuildResources, PlatformName, ServiceStatus } from "@/lib/api/types";
import { PERMISSIONS, permissionLabel } from "@/lib/dashboard/resources";
import { useServiceStatus } from "@/lib/api/status";
import { Skeleton } from "@/components/ui/skeleton";
import { guildInviteUrl } from "@/lib/urls";
import { EASE_OUT } from "@/lib/motion";
import { m } from "motion/react";
import Link from "next/link";
import cn from "@/lib/cn";


interface Issue {
    id: string;
    icon: React.ReactNode;
    title: React.ReactNode;
    detail?: React.ReactNode;
    href: string;
    action: string;
    external?: boolean;
}

function findIssues(guildId: string, overview: GuildOverview, resources: GuildResources): Issue[] {
    const issues: Issue[] = [];
    const base = `/dashboard/${guildId}`;

    for (const name of resources.bot.missing) {
        issues.push({
            id: `perm:${name}`,
            icon: <ShieldAlert />,
            title: <>Missing <span className="text-paper">{permissionLabel(name)}</span></>,
            detail: PERMISSIONS[name] ? `Oreo needs it to ${PERMISSIONS[name].why}.` : undefined,
            href: guildInviteUrl(guildId),
            action: "Grant",
            external: true
        });
    }

    for (const item of overview.creators) {
        if (!item.enabled) continue;
        const name = <span className="text-paper">{item.creator.displayName}</span>;
        const href = `${base}/creators/${item.id}`;
        const channel = item.channelId ? resources.channels.find((entry) => entry.id === item.channelId) : undefined;

        if (!item.channelId) {
            issues.push({ id: `nochannel:${item.id}`, icon: <TriangleAlert />, title: <>{name} has no channel</>, detail: "Nothing is posted until you pick one.", href, action: "Pick" });
        } else if (!channel) {
            issues.push({ id: `gone:${item.id}`, icon: <TriangleAlert />, title: <>{name}&apos;s channel is gone</>, detail: "It was deleted, or Oreo can't see it.", href, action: "Fix" });
        } else if (!channel.canSend) {
            issues.push({ id: `cantsend:${item.id}`, icon: <TriangleAlert />, title: <>Oreo can&apos;t post in #{channel.name}</>, detail: <>Used by {name}.</>, href, action: "Fix" });
        }

        if (item.creator.subscriptionStatus === "failed") {
            issues.push({
                id: `sub:${item.id}`,
                icon: <WifiOff />,
                title: <>{name} isn&apos;t connected</>,
                detail: "Updates aren't coming through yet. Oreo retries on its own.",
                href,
                action: "View"
            });
        }
    }

    for (const counter of overview.counters) {
        const channel = resources.channels.find((entry) => entry.id === counter.channelId);
        if (!channel || !channel.canManage) {
            issues.push({
                id: `counter:${counter.id}`,
                icon: <TriangleAlert />,
                title: channel ? <>Oreo can&apos;t rename <span className="text-paper">{channel.name}</span></> : "A counter's channel is gone",
                detail: channel ? "Give it Manage Channels there, or the count stops updating." : "Remove the counter, or add it again.",
                href: `${base}/counters`,
                action: "Fix"
            });
        }
    }

    return issues;
}


function systemIssues(overview: GuildOverview, status: ServiceStatus | undefined): Issue[] {
    if (!status) return [];
    const platforms = new Set<PlatformName>(overview.creators.filter((item) => item.enabled).map((item) => item.creator.platform));
    const issues: Issue[] = [];

    for (const component of status.components) {
        if (component.status === "operational") continue;
        const down = component.status === "down";
        if (component.id === "bot") {
            issues.push({
                id: "system:bot",
                icon: <Radio />,
                title: down ? "Oreo's bot is offline" : "Oreo's bot is having trouble",
                detail: down ? "Nothing is posted until it reconnects. No action needed on your side." : component.detail ?? "Notifications may be delayed.",
                href: "/dashboard/status",
                action: "Status"
            });
        } else if (component.id === "events") {
            issues.push({
                id: "system:events",
                icon: <Radio />,
                title: "Notifications may be delayed",
                detail: component.detail ?? "Oreo's notification pipeline is running behind.",
                href: "/dashboard/status",
                action: "Status"
            });
        } else if ((["youtube", "twitch", "kick"] as string[]).includes(component.id) && platforms.has(component.id as PlatformName)) {
            issues.push({
                id: `system:${component.id}`,
                icon: <Radio />,
                title: `${component.name} updates are delayed`,
                detail: component.detail ?? `Oreo's connection to ${component.name} is having trouble.`,
                href: "/dashboard/status",
                action: "Status"
            });
        } else if (component.group === "core" && down) {
            issues.push({
                id: `system:${component.id}`,
                icon: <Radio />,
                title: `Oreo's ${component.name.toLowerCase()} is down`,
                detail: "Notifications and changes may fail until it's back.",
                href: "/dashboard/status",
                action: "Status"
            });
        }
    }
    return issues;
}


export function HealthCard({
    guildId,
    overview,
    resources
}: {
    guildId: string;
    overview: GuildOverview;
    resources: GuildResources | undefined;
}) {
    const issues = resources ? findIssues(guildId, overview, resources) : [];
    const status = useServiceStatus();
    const oreo = systemIssues(overview, status.data);

    return (
        <section className="panel flex flex-col rounded-2xl" aria-labelledby="health-heading">
            <header className="flex items-center justify-between px-5 pt-5">
                <h2 id="health-heading" className="flex items-center gap-2.5 font-display text-xl leading-tight text-paper">
                    <span className="icon-chip size-8 [&_svg]:size-4" aria-hidden="true"><ShieldAlert /></span>
                    Setup health
                </h2>
                {resources && (
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums", issues.length ? "bg-warn/12 text-warn" : oreo.length ? "bg-paper/[0.06] text-paper/70" : "bg-ok/12 text-ok")}>
                        {issues.length ? `${issues.length} to fix` : oreo.length ? "Nothing to fix" : "All good"}
                    </span>
                )}
            </header>

            <div className="flex flex-1 flex-col p-2">
                {!resources && (
                    <div className="space-y-3 p-2" aria-hidden="true">
                        {[0, 1, 2].map((index) => (
                            <Skeleton key={index} className="h-9 w-full" />
                        ))}
                    </div>
                )}

                {oreo.length > 0 && (
                    <ul className="mb-1 space-y-0.5 border-b border-paper/[0.06] pb-1.5" aria-label="On Oreo's side">
                        {oreo.map((issue) => (
                            <li key={issue.id}>
                                <Link href={issue.href} className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-paper/[0.04]">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-paper/[0.06] text-paper/70 [&_svg]:size-4" aria-hidden="true">{issue.icon}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-paper/80">
                                            {issue.title}
                                            <span className="shrink-0 rounded bg-paper/[0.07] px-1 text-[0.625rem] font-medium text-paper/60">Oreo</span>
                                        </span>
                                        {issue.detail && <span className="mt-0.5 block text-sm leading-relaxed text-paper/65">{issue.detail}</span>}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-paper/[0.06] px-2.5 py-1 text-xs font-semibold text-paper/75 group-hover:text-paper">
                                        {issue.action}
                                        <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {resources && issues.length === 0 && oreo.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
                        <span className="grid size-12 place-items-center rounded-2xl bg-ok/12 text-ok ring-1 ring-inset ring-ok/20">
                            <CircleCheck className="size-5" />
                        </span>
                        <p className="mt-3 text-sm font-medium text-paper/85">Everything&apos;s set</p>
                        <p className="mt-1 max-w-64 text-sm leading-relaxed text-paper/65">
                            Oreo has its permissions and can post in every channel you picked.
                        </p>
                    </div>
                )}

                <ul className="space-y-0.5">
                    {issues.slice(0, 6).map((issue, index) => (
                        <m.li
                            key={issue.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: EASE_OUT, delay: index * 0.04 }}
                        >
                            <Link
                                href={issue.href}
                                target={issue.external ? "_blank" : undefined}
                                rel={issue.external ? "noreferrer" : undefined}
                                prefetch={false}
                                className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-paper/[0.04]"
                            >
                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-warn/12 text-warn [&_svg]:size-4" aria-hidden="true">{issue.icon}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-paper/85">{issue.title}</span>
                                    {issue.detail && <span className="mt-0.5 block text-sm leading-relaxed text-paper/65">{issue.detail}</span>}
                                </span>
                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-cream-500/12 px-2.5 py-1 text-xs font-semibold text-cream-300 transition-colors group-hover:bg-cream-500 group-hover:text-cream-900">
                                    {issue.action}
                                    <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                                </span>
                            </Link>
                        </m.li>
                    ))}
                </ul>
                {issues.length > 6 && <p className="px-2 pt-1 text-xs text-paper/55">And {issues.length - 6} more.</p>}
            </div>
        </section>
    );
}


export function SetupSteps({
    guildId,
    overview,
    deliveries,
    onAdd
}: {
    guildId: string;
    overview: GuildOverview;
    deliveries: Delivery[] | undefined;
    onAdd: () => void;
}) {
    const first = overview.creators[0];
    const sent = Object.values(overview.stats.notifications).some((count) => count > 0) || Boolean(deliveries?.length);
    const steps = [
        {
            title: "Add a creator",
            detail: "A YouTube, Twitch or Kick channel for Oreo to watch.",
            done: overview.creators.length > 0,
            action: <StepButton onClick={onAdd}>Add creator</StepButton>
        },
        {
            title: "Pick where they post",
            detail: "Choose a text or announcement channel for each creator.",
            done: overview.creators.length > 0 && overview.creators.every((item) => item.channelId),
            action: first ? <StepLink href={`/dashboard/${guildId}/creators/${(overview.creators.find((item) => !item.channelId) ?? first).id}`}>Choose channel</StepLink> : null
        },
        {
            title: "Send a test",
            detail: "See exactly what your members will get, in your server.",
            done: sent,
            action: first ? <StepLink href={`/dashboard/${guildId}/creators/${first.id}#preview`}>Open preview</StepLink> : null
        }
    ];
    const done = steps.filter((step) => step.done).length;
    if (done === steps.length) return null;
    const next = steps.findIndex((step) => !step.done);

    return (
        <section className="panel rounded-2xl p-4 sm:p-5" aria-labelledby="setup-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="setup-heading" className="font-display text-xl leading-tight text-paper">Finish setting up</h2>
                    <p className="mt-0.5 text-sm text-paper/65">{done} of {steps.length} done</p>
                </div>
                <div className="flex w-32 gap-1" aria-hidden="true">
                    {steps.map((step, index) => (
                        <m.span
                            key={step.title}
                            className="h-1 flex-1 rounded-full"
                            initial={false}
                            animate={{ backgroundColor: step.done ? "var(--color-cream-500)" : "rgba(244,240,236,0.08)" }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                        />
                    ))}
                </div>
            </div>
            <ol className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                {steps.map((step, index) => (
                    <li
                        key={step.title}
                        className={cn(
                            "flex flex-col rounded-xl border p-4 transition-colors",
                            index === next ? "raised-depth border-cream-400/35 bg-ink-800" : "border-paper/[0.06] bg-ink-900",
                            step.done && "opacity-70"
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            <span
                                className={cn(
                                    "grid size-7 shrink-0 place-items-center rounded-lg font-display text-sm",
                                    step.done ? "bg-ok/15 text-ok" : index === next ? "accent-depth bg-cream-500 text-cream-900" : "bg-paper/[0.07] text-paper/65"
                                )}
                            >
                                {step.done ? <Check className="size-3.5" /> : index + 1}
                            </span>
                            <span className={cn("text-sm font-medium", step.done ? "text-paper/60 line-through decoration-paper/25" : "text-paper")}>
                                {step.title}
                            </span>
                        </div>
                        <p className="mt-2 flex-1 text-xs leading-relaxed text-paper/65">{step.detail}</p>
                        {!step.done && index === next && step.action && <div className="mt-3.5">{step.action}</div>}
                    </li>
                ))}
            </ol>
        </section>
    );
}

function StepButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="accent-depth inline-flex h-8 items-center gap-1.5 rounded-lg bg-cream-500 px-3 text-xs font-semibold text-cream-900 transition-[background-color,transform,box-shadow] duration-150 hover:bg-cream-450"
        >
            {children}
            <ArrowRight className="size-3" />
        </button>
    );
}

function StepLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="accent-depth inline-flex h-8 items-center gap-1.5 rounded-lg bg-cream-500 px-3 text-xs font-semibold text-cream-900 transition-[background-color,transform,box-shadow] duration-150 hover:bg-cream-450"
        >
            {children}
            <ArrowRight className="size-3" />
        </Link>
    );
}

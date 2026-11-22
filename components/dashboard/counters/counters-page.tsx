"use client";

import { ChevronDown, Crown, FolderClosed, Gauge, Hash, LoaderCircle, Megaphone, Pencil, Plus, Trash, TriangleAlert, Volume2, Wand } from "@/components/ui/glyphs";
import { DEFAULT_COUNTER_TEMPLATES, LOOKUP_HINTS, PLATFORM_METRICS, PLATFORM_ORDER, SAMPLE_COUNTS, platformName } from "@/lib/dashboard/platforms";
import type { CounterMetric, Creator, GuildCounter, GuildOverview, GuildResources, PlatformName } from "@/lib/api/types";
import { COUNTER_TYPES, type ResourceChannel, sidebarOrder } from "@/lib/dashboard/resources";
import { COUNTER_METRIC_LABELS, renderCounterName } from "@/lib/notification/render";
import { TemplateField } from "@/components/dashboard/template-field";
import { Combobox, type ComboOption } from "@/components/ui/combobox";
import { COUNTER_PLACEHOLDERS } from "@/lib/dashboard/placeholders";
import { PickerFallback } from "@/components/dashboard/options";
import { CreatorAvatar } from "@/components/dashboard/avatars";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { mutate, revalidate, useApi } from "@/lib/api/hooks";
import { useEffect, useId, useMemo, useState } from "react";
import { api, errorMessage, paths } from "@/lib/api/client";
import { PageHeader } from "@/components/dashboard/states";
import { useToast } from "@/components/dashboard/toast";
import { Segmented } from "@/components/ui/segmented";
import { Field, Input } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscordIcon } from "@/components/ui/icons";
import { AnimatePresence, m } from "motion/react";
import { Callout } from "@/components/ui/callout";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EASE_OUT, spring } from "@/lib/motion";
import { premiumOnSale } from "@/lib/premium";
import cn from "@/lib/cn";


const MAX_TEMPLATE = 90;
const OTHER = "other";

function sampleName(template: string, creator: Pick<Creator, "displayName" | "platform"> | undefined, metric: CounterMetric) {
    if (!creator) return template;
    return renderCounterName(template, { value: SAMPLE_COUNTS[metric], name: creator.displayName, platform: creator.platform, metric }) ?? "";
}

function templateError(template: string): string | null {
    const value = template.trim();
    if (!value) return "Give the channel a name.";
    if (!value.includes("{count}") && !value.includes("{count.exact}")) return "Include {count} so the number shows up.";
    if (value.length > MAX_TEMPLATE) return `Keep it under ${MAX_TEMPLATE} characters.`;
    return null;
}


export function CountersPage({ guildId }: { guildId: string }) {
    const overview = useApi<GuildOverview>(paths.guild(guildId));
    const resources = useApi<GuildResources>(paths.resources(guildId));
    const toast = useToast();
    const [dialog, setDialog] = useState<{ mode: "add" } | { mode: "edit", counter: GuildCounter } | null>(null);
    const [removing, setRemoving] = useState<GuildCounter | null>(null);
    const [pending, setPending] = useState(false);

    if (!overview.data) return <PageSkeleton />;

    const data = overview.data;
    const { used, total } = data.limits.counters;
    const full = used >= total;

    const remove = async () => {
        if (!removing) return;
        setPending(true);
        try {
            await api.delete(paths.counter(guildId, removing.id));
            mutate<GuildOverview>(paths.guild(guildId), (current) =>
                current && {
                    ...current,
                    counters: current.counters.filter((item) => item.id !== removing.id),
                    limits: { ...current.limits, counters: { ...current.limits.counters, used: Math.max(0, current.limits.counters.used - 1) } }
                }
            );
            toast.success("Counter removed", { description: "The channel stays. Oreo just stops renaming it." });
            setRemoving(null);
        } catch (error) {
            toast.error(error, { title: "Couldn't remove the counter" });
        } finally {
            setPending(false);
        }
    };

    const addButton = (
        <Button variant="primary" size="lg" onClick={() => setDialog({ mode: "add" })} disabled={full}>
            <Plus />
            Add counter
        </Button>
    );

    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <PageHeader
                title="Counters"
                description="Channels whose name shows a creator's live count. Oreo keeps them up to date every few minutes."
                actions={
                    full ? (
                        <Tooltip content={`This server can have ${total} counters. Remove one first${!data.limits.premium && premiumOnSale(data.limits) ? ", or get premium for more" : ""}.`}>
                            {addButton}
                        </Tooltip>
                    ) : (
                        addButton
                    )
                }
            />

            <section className="panel mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center" aria-label="Counter slots">
                <div className="flex items-center gap-3.5">
                    <span className="icon-chip size-11 rounded-xl [&_svg]:size-5" aria-hidden="true"><Gauge /></span>
                    <div>
                        <p className="font-display text-[1.75rem] leading-none text-paper">
                            {used}
                            <span className="font-sans text-base font-medium text-paper/55"> / {total}</span>
                        </p>
                        <p className="mt-1 text-sm text-paper/65">counter slots used</p>
                    </div>
                </div>
                <div className="flex flex-1 items-center gap-1.5 sm:px-4" aria-hidden="true">
                    {Array.from({ length: total }).map((_, index) => (
                        <span key={index} className={cn("h-2 flex-1 rounded-full", index < used ? (full ? "bg-warn" : "accent-fill") : "bg-paper/[0.07]")} />
                    ))}
                </div>
                {full && !data.limits.premium && premiumOnSale(data.limits) ? (
                    <Button variant="secondary" size="md" href="/dashboard/premium">
                        <Crown />
                        Premium gets 10
                    </Button>
                ) : (
                    <p className="text-sm text-paper/65">{total - used} free</p>
                )}
            </section>

            <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AnimatePresence initial={false}>
                        {data.counters.map((counter, index) => {
                            const { creator } = counter;
                            const channel = resources.data?.channels.find((item) => item.id === counter.channelId);
                            const label = channel?.name ?? sampleName(counter.template, creator, counter.metric);
                            const problem = resources.data && !channel ? "Channel not found" : channel && !channel.canManage ? "Oreo can't rename it" : null;
                            return (
                                <m.li
                                    key={counter.id}
                                    layout
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT, delay: Math.min(index, 8) * 0.03 } }}
                                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
                                    transition={spring.layout}
                                    className="panel flex flex-col rounded-2xl p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <CreatorAvatar creator={creator} className="size-10 text-xs" badgeClassName="size-4 ring-2 [&_svg]:size-2.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-paper">{creator.displayName}</p>
                                            <p className="truncate text-xs text-paper/60">@{creator.username} · {platformName(creator.platform)}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-cream-500/12 px-2.5 py-1 text-xs font-semibold text-cream-300">
                                            {COUNTER_METRIC_LABELS[counter.metric]}
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-xl bg-[#2B2D31] p-2">
                                        <span className="flex items-center gap-1.5 rounded-[4px] bg-[#404249] px-2 py-[6px] text-[0.9375rem] font-medium text-[#F2F3F5]">
                                            <Volume2 className="size-4 shrink-0 text-[#80848E]" aria-hidden="true" />
                                            <span className="truncate">{label || "…"}</span>
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        {problem ? (
                                            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-warn/12 px-2.5 py-1 text-xs font-semibold text-warn">
                                                <TriangleAlert className="size-3.5 shrink-0" />
                                                <span className="truncate">{problem}</span>
                                            </span>
                                        ) : (
                                            <code className="min-w-0 truncate font-mono text-xs text-paper/55" title={counter.template}>{counter.template}</code>
                                        )}
                                        <div className="ml-auto flex shrink-0 gap-1.5">
                                            <Button variant="secondary" size="sm" onClick={() => setDialog({ mode: "edit", counter })} aria-label={`Edit counter ${label}`}>
                                                <Pencil />
                                                Edit
                                            </Button>
                                            <Tooltip content="Delete counter">
                                                <button
                                                    type="button"
                                                    onClick={() => setRemoving(counter)}
                                                    aria-label={`Delete counter ${label}`}
                                                    className="grid size-8 place-items-center rounded-[0.625rem] border border-bad/20 bg-bad/[0.06] text-[var(--color-bad-300)] transition-colors hover:bg-bad/15"
                                                >
                                                    <Trash className="size-3.5" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </m.li>
                            );
                        })}
                    </AnimatePresence>
                    {Array.from({ length: Math.max(0, total - used) }).map((_, index) => (
                        <li key={`free-${index}`}>
                            <button
                                type="button"
                                onClick={() => setDialog({ mode: "add" })}
                                className="group flex size-full min-h-[11.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-paper/12 bg-paper/[0.015] p-4 text-center transition-colors hover:border-cream-500/40 hover:bg-cream-500/[0.04]"
                            >
                                <span className="icon-chip size-11 rounded-xl transition-transform duration-200 group-hover:scale-105 [&_svg]:size-5" aria-hidden="true"><Plus /></span>
                                <span className="text-sm font-medium text-paper/80 group-hover:text-paper">Add a counter</span>
                                <span className="text-xs text-paper/55">Any creator&apos;s subscribers, followers, videos or views</span>
                            </button>
                        </li>
                    ))}
                </ul>

                <ServerPreview overview={data} resources={resources.data} />
            </div>

            <CounterDialog
                open={dialog !== null}
                onClose={() => setDialog(null)}
                counter={dialog?.mode === "edit" ? dialog.counter : null}
                guildId={guildId}
                overview={data}
                resources={resources.data}
            />

            <ConfirmDialog
                open={removing !== null}
                onClose={() => setRemoving(null)}
                onConfirm={remove}
                pending={pending}
                title="Delete this counter?"
                description="Oreo stops updating the channel's name. The channel itself stays in your server. Delete it in Discord if you don't need it."
                confirmLabel="Delete counter"
            />
        </div>
    );
}


function ServerPreview({ overview, resources }: { overview: GuildOverview, resources: GuildResources | undefined }) {
    const counterChannels = new Set(overview.counters.map((counter) => counter.channelId));
    const groups = useMemo(() => {
        if (!resources) return [];
        const byGroup = new Map<string, ResourceChannel[]>();
        const categories = new Map(resources.channels.filter((channel) => channel.type === "category").map((channel) => [channel.id, channel.name]));
        for (const { channel, group } of sidebarOrder(resources.channels, (channel) => channel.type !== "category")) {
            const parent = channel.parentId ? categories.get(channel.parentId) : undefined;
            if (!counterChannels.has(channel.id) && !resources.channels.some((item) => counterChannels.has(item.id) && item.parentId === channel.parentId)) continue;
            const key = parent ?? group;
            byGroup.set(key, [...(byGroup.get(key) ?? []), channel]);
        }
        return [...byGroup.entries()].slice(0, 3);
    }, [resources, overview.counters]);

    return (
        <aside className="panel overflow-hidden rounded-2xl lg:sticky lg:top-24" aria-label="How they look in Discord">
            <p className="flex items-center gap-2.5 px-4 pb-3 pt-4 font-display text-lg leading-tight text-paper">
                <span className="grid size-8 place-items-center rounded-lg bg-blurple text-white [&_svg]:size-4" aria-hidden="true"><DiscordIcon /></span>
                In your server
            </p>
            <div className="mx-3 mb-3 rounded-xl bg-[#2B2D31] p-3">
            {!resources ? (
                <div className="space-y-2 p-1">
                    {[0, 1, 2].map((index) => (
                        <Skeleton key={index} className="h-6 w-full rounded-md" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map(([group, channels]) => (
                        <div key={group}>
                            <p className="flex items-center gap-0.5 px-1 text-xs font-semibold uppercase tracking-[0.02em] text-[#949BA4]">
                                <ChevronDown className="size-3" />
                                {group}
                            </p>
                            <ul className="mt-1 space-y-px">
                                {channels.slice(0, 8).map((channel) => {
                                    const counter = counterChannels.has(channel.id);
                                    return (
                                        <li
                                            key={channel.id}
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-[4px] px-2 py-[5px] text-[0.9375rem]",
                                                counter ? "bg-[#404249] text-[#F2F3F5]" : "text-[#80848E]"
                                            )}
                                        >
                                            <ChannelIcon channel={channel} className="size-4 shrink-0 text-[#80848E]" />
                                            <span className="truncate">{channel.name}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            {resources && groups.length === 0 && <p className="px-1 py-2 text-xs text-[#949BA4]">Counter channels show up here once you add one.</p>}
            </div>
            <p className="border-t border-paper/[0.06] px-4 py-3 text-xs leading-relaxed text-paper/60">
                Discord limits renames, so a new number can take up to 10 minutes to show.
            </p>
        </aside>
    );
}


function ChannelIcon({ channel, className }: { channel: Pick<ResourceChannel, "type">, className?: string }) {
    switch (channel.type) {
        case "voice":
        case "stage":
            return <Volume2 className={className} aria-hidden="true" />;
        case "category":
            return <FolderClosed className={className} aria-hidden="true" />;
        case "announcement":
            return <Megaphone className={className} aria-hidden="true" />;
        default:
            return <Hash className={className} aria-hidden="true" />;
    }
}


interface DialogProps {
    open: boolean;
    onClose: () => void;
    counter: GuildCounter | null;
    guildId: string;
    overview: GuildOverview;
    resources: GuildResources | undefined;
}

function CounterDialog({ open, onClose, counter, guildId, overview, resources }: DialogProps) {
    const toast = useToast();
    const resourcesState = useApi<GuildResources>(open ? paths.resources(guildId) : null);
    const creatorLabel = useId();
    const channelLabel = useId();
    const metricLabel = useId();
    const queryId = useId();
    const editing = counter !== null;

    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [platform, setPlatform] = useState<PlatformName>("youtube");
    const [query, setQuery] = useState("");
    const [metric, setMetric] = useState<CounterMetric>("followers");
    const [template, setTemplate] = useState("");
    const [mode, setMode] = useState<"create" | "existing">("create");
    const [channelId, setChannelId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [failure, setFailure] = useState<string | null>(null);
    const [showErrors, setShowErrors] = useState(false);

    const other = !editing && creatorId === OTHER;
    const creator: Creator | undefined = counter?.creator ?? overview.creators.find((item) => String(item.id) === creatorId)?.creator;
    const creatorPlatform = other ? platform : creator?.platform;
    const metrics = creatorPlatform ? PLATFORM_METRICS[creatorPlatform] : [];

    useEffect(() => {
        if (!open) return;
        const initial = overview.creators[0];
        const initialPlatform = counter?.creator.platform ?? initial?.creator.platform ?? "youtube";
        const initialMetric = counter?.metric ?? PLATFORM_METRICS[initialPlatform][0]!;
        setCreatorId(initial ? String(initial.id) : OTHER);
        setPlatform("youtube");
        setQuery("");
        setMetric(initialMetric);
        setTemplate(counter?.template ?? DEFAULT_COUNTER_TEMPLATES[initialMetric]);
        setMode("create");
        setChannelId(null);
        setFailure(null);
        setShowErrors(false);
    }, [open]);

    const fitMetric = (next: PlatformName) => {
        const allowed = PLATFORM_METRICS[next];
        if (!allowed.includes(metric)) pickMetric(allowed[0]!);
    };
    const pickCreator = (value: string | null) => {
        setCreatorId(value);
        const next = value === OTHER ? platform : overview.creators.find((item) => String(item.id) === value)?.creator.platform;
        if (next) fitMetric(next);
    };
    const pickPlatform = (value: PlatformName) => {
        setPlatform(value);
        fitMetric(value);
    };
    const pickMetric = (value: CounterMetric) => {
        if (Object.values(DEFAULT_COUNTER_TEMPLATES).includes(template.trim())) setTemplate(DEFAULT_COUNTER_TEMPLATES[value]);
        setMetric(value);
    };

    const channelOptions = useMemo<ComboOption[]>(() => {
        if (!resources) return [];
        const usedChannels = new Set(overview.counters.filter((item) => item.id !== counter?.id).map((item) => item.channelId));
        const listed = sidebarOrder(resources.channels, (channel) => COUNTER_TYPES.includes(channel.type)).map(({ channel, group }) => ({ channel, group }));
        const categories = resources.channels
            .filter((channel) => channel.type === "category")
            .sort((a, b) => a.position - b.position)
            .map((channel) => ({ channel, group: "Categories" }));
        return [...listed, ...categories].map(({ channel, group }) => {
            const taken = usedChannels.has(channel.id);
            return {
                value: channel.id,
                label: channel.name,
                group,
                icon: <ChannelIcon channel={channel} className="size-4" />,
                disabled: taken,
                warn: !taken && !channel.canManage,
                hint: taken ? "Has a counter" : !channel.canManage ? "Can't rename" : undefined,
                keywords: channel.type
            };
        });
    }, [resources, overview.counters, counter]);

    const selectedChannel = resources?.channels.find((item) => item.id === channelId);
    const error = templateError(template);
    const preview = sampleName(template.trim() || " ", other ? { displayName: query.trim() || platformName(platform), platform } : creator, metric);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setShowErrors(true);
        if (error || (other ? !query.trim() : !creator) || (!editing && mode === "existing" && !channelId)) return;

        setSubmitting(true);
        setFailure(null);
        const trimmed = template.trim();
        try {
            if (counter) {
                const patch: { metric?: CounterMetric, template?: string } = {};
                if (metric !== counter.metric) patch.metric = metric;
                if (trimmed !== counter.template) patch.template = trimmed;
                if (Object.keys(patch).length) {
                    const updated = await api.patch<GuildCounter>(paths.counter(guildId, counter.id), patch);
                    mutate<GuildOverview>(paths.guild(guildId), (current) =>
                        current && { ...current, counters: current.counters.map((item) => (item.id === updated.id ? updated : item)) }
                    );
                }
                toast.success("Counter updated", { description: "Discord may take a few minutes to show the new name." });
            } else {
                const body: { platform: PlatformName, query: string, metric: CounterMetric, template?: string, channelId?: string } = other
                    ? { platform, query: query.trim(), metric }
                    : { platform: creator!.platform, query: creator!.url, metric };
                if (trimmed !== DEFAULT_COUNTER_TEMPLATES[metric]) body.template = trimmed;
                if (mode === "existing" && channelId) body.channelId = channelId;

                const created = await api.post<GuildCounter>(paths.counters(guildId), body);
                mutate<GuildOverview>(paths.guild(guildId), (current) =>
                    current && {
                        ...current,
                        counters: [...current.counters, created],
                        limits: { ...current.limits, counters: { ...current.limits.counters, used: current.limits.counters.used + 1 } }
                    }
                );
                // A brand-new channel isn't in the cached channel list yet
                if (mode === "create") void revalidate(paths.resources(guildId));
                toast.success("Counter added", { description: "Oreo fills in the real number within a few minutes." });
            }
            onClose();
        } catch (caught) {
            setFailure(errorMessage(caught));
        } finally {
            setSubmitting(false);
        }
    };

    const creatorOptions: ComboOption[] = [
        ...overview.creators.map((item) => ({
            value: String(item.id),
            label: item.creator.displayName,
            description: `@${item.creator.username} · ${platformName(item.creator.platform)}`,
            icon: <CreatorAvatar creator={item.creator} className="size-6 text-[0.55rem]" badgeClassName="size-3.5 ring-1 [&_svg]:size-2" />
        })),
        { value: OTHER, label: "Another creator", description: "Any YouTube, Twitch or Kick channel", icon: <Plus className="size-4" /> }
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            dismissible={!submitting}
            icon={<Gauge />}
            title={editing ? "Edit counter" : "Add a counter"}
            description={editing ? "Change what it counts or how the channel is named." : "A channel whose name shows a live count, kept up to date by Oreo."}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" size="lg" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" size="lg" type="submit" form="counter-form" disabled={submitting || (showErrors && Boolean(error))}>
                        {submitting && <LoaderCircle className="animate-spin" />}
                        {editing ? "Save counter" : "Add counter"}
                    </Button>
                </>
            }
        >
            <form id="counter-form" onSubmit={submit} className="space-y-5" noValidate>
                <div className={cn("grid gap-5", !editing && "sm:grid-cols-2")}>
                    {!editing && (
                        <Field label="Creator" labelId={creatorLabel}>
                            <Combobox value={creatorId} onChange={pickCreator} options={creatorOptions} placeholder="Pick a creator" aria-labelledby={creatorLabel} />
                        </Field>
                    )}

                    <Field label="Shows" labelId={metricLabel}>
                        {metrics.length > 1 ? (
                            <Segmented
                                labelledBy={metricLabel}
                                value={metric}
                                onChange={pickMetric}
                                fill
                                options={metrics.map((item) => ({ value: item, label: COUNTER_METRIC_LABELS[item] }))}
                            />
                        ) : (
                            <p className="flex h-10 items-center rounded-[0.625rem] border border-paper/8 bg-ink-900 px-3 text-sm text-paper/70">
                                {COUNTER_METRIC_LABELS[metric]}
                                {creatorPlatform && <span className="ml-1 text-paper/55">· the only stat {platformName(creatorPlatform)} shares</span>}
                            </p>
                        )}
                    </Field>
                </div>

                {other && (
                    <div className="space-y-3">
                        <Segmented label="Platform" value={platform} onChange={pickPlatform} options={PLATFORM_ORDER.map((item) => ({ value: item, label: platformName(item) }))} />
                        <Field
                            label={LOOKUP_HINTS[platform].label}
                            htmlFor={queryId}
                            description={LOOKUP_HINTS[platform].help}
                            error={showErrors && !query.trim() ? "Enter the channel to count." : undefined}
                        >
                            <Input id={queryId} value={query} onChange={(event) => setQuery(event.target.value)} maxLength={200} placeholder={LOOKUP_HINTS[platform].placeholder} autoComplete="off" />
                        </Field>
                    </div>
                )}

                {!editing && (
                    <fieldset>
                        <legend className="mb-1.5 text-sm font-medium text-paper/85">Channel</legend>
                        <div
                            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                            role="radiogroup"
                            aria-label="Channel"
                            onKeyDown={(event) => {
                                if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
                                event.preventDefault();
                                const next = mode === "create" ? "existing" : "create";
                                setMode(next);
                                (event.currentTarget.querySelector(`[data-choice="${next}"]`) as HTMLElement | null)?.focus();
                            }}
                        >
                            <ChoiceCard
                                value="create"
                                checked={mode === "create"}
                                onSelect={() => setMode("create")}
                                icon={<Wand />}
                                title="Create a new one"
                                description="A locked voice channel nobody can join."
                            />
                            <ChoiceCard
                                value="existing"
                                checked={mode === "existing"}
                                onSelect={() => setMode("existing")}
                                icon={<Volume2 />}
                                title="Use an existing one"
                                description="Oreo renames a channel you pick."
                            />
                        </div>

                        <AnimatePresence initial={false}>
                            {mode === "existing" && (
                                <m.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1, transition: { height: spring.smooth, opacity: { duration: 0.2 } } }}
                                    exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 pt-3">
                                        <span id={channelLabel} className="sr-only">Existing channel</span>
                                        {resources ? (
                                            <Combobox
                                                value={channelId}
                                                onChange={setChannelId}
                                                options={channelOptions}
                                                placeholder="Pick a channel"
                                                searchPlaceholder="Search channels"
                                                emptyText="No channel matches."
                                                invalid={showErrors && !channelId}
                                                aria-labelledby={channelLabel}
                                            />
                                        ) : (
                                            <PickerFallback error={resourcesState.error} onRetry={() => void resourcesState.reload().catch(() => null)} />
                                        )}
                                        {showErrors && !channelId && <p className="text-xs text-[var(--color-bad-300)]">Pick the channel to rename.</p>}
                                        {selectedChannel && !selectedChannel.canManage && (
                                            <Callout tone="warning">
                                                Oreo can&apos;t rename <strong className="font-medium text-paper">{selectedChannel.name}</strong>. Give it the Manage
                                                Channels permission there, or the count won&apos;t update.
                                            </Callout>
                                        )}
                                    </div>
                                </m.div>
                            )}
                        </AnimatePresence>
                    </fieldset>
                )}

                <TemplateField
                    label="Channel name"
                    value={template}
                    onChange={setTemplate}
                    placeholders={COUNTER_PLACEHOLDERS}
                    max={MAX_TEMPLATE}
                    error={showErrors ? error ?? undefined : undefined}
                    description="Must include {count}. Emoji welcome."
                />

                <div>
                    <span className="mb-1.5 block text-sm font-medium text-paper/85">Preview</span>
                    <div className="rounded-xl bg-[#2B2D31] p-2.5">
                        <p className="flex items-center gap-0.5 px-1 pb-1 text-xs font-semibold uppercase text-[#949BA4]">
                            <ChevronDown className="size-3" />
                            Stats
                        </p>
                        <span className="flex items-center gap-1.5 rounded-[4px] bg-[#404249] px-2 py-[5px] text-[0.9375rem] text-[#F2F3F5]">
                            <Volume2 className="size-4 shrink-0 text-[#80848E]" aria-hidden="true" />
                            <span className="truncate">{preview || "…"}</span>
                        </span>
                    </div>
                    <p className="mt-1.5 text-xs text-paper/50">With a sample count of {SAMPLE_COUNTS[metric].toLocaleString("en")}.</p>
                </div>

                {failure && (
                    <Callout
                        tone="danger"
                        role="alert"
                        title="Couldn't save the counter"
                        action={
                            /counters/i.test(failure) && !overview.limits.premium && premiumOnSale(overview.limits) ? (
                                <Button href="/dashboard/premium" external variant="secondary" size="xs">
                                    <Crown />
                                    Get premium
                                </Button>
                            ) : undefined
                        }
                    >
                        {failure}
                    </Callout>
                )}
            </form>
        </Dialog>
    );
}


function ChoiceCard({
    value,
    checked,
    onSelect,
    icon,
    title,
    description
}: {
    value: string;
    checked: boolean;
    onSelect: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            data-choice={value}
            onClick={onSelect}
            className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors duration-150",
                checked ? "border-cream-400/35 bg-cream-500/[0.06]" : "border-paper/8 bg-ink-900 hover:border-paper/14"
            )}
        >
            <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg [&_svg]:size-4", checked ? "bg-cream-500/15 text-cream-400" : "bg-ink-700 text-paper/60")}>
                {icon}
            </span>
            <span className="min-w-0">
                <span className={cn("block text-sm font-medium", checked ? "text-paper" : "text-paper/70")}>{title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-paper/60">{description}</span>
            </span>
            <span
                className={cn("ml-auto mt-1 grid size-4 shrink-0 place-items-center rounded-full border transition-colors", checked ? "border-cream-400 bg-cream-500" : "border-paper/20")}
                aria-hidden="true"
            >
                {checked && <span className="size-1.5 rounded-full bg-[var(--color-cream-900)]" />}
            </span>
        </button>
    );
}


function PageSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[76rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8" aria-busy="true" aria-label="Loading counters">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
            <div className="panel mt-8 divide-hairline rounded-2xl">
                {[0, 1].map((index) => (
                    <div key={index} className="space-y-2.5 p-4">
                        <Skeleton className="h-7 w-64 rounded-md" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                ))}
            </div>
        </div>
    );
}

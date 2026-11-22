"use client";

import { MAX_PING_ROLES, type ContentType, type GuildCreator, type GuildOverview, type GuildResources, type LookupResult, type PlatformName } from "@/lib/api/types";
import { DEFAULT_YOUTUBE_CONTENT_TYPES, LOOKUP_HINTS, PLATFORM_CONTENT_TYPES, PLATFORM_ORDER, platformColor, platformName } from "@/lib/dashboard/platforms";
import { ArrowRight, Crown, ExternalLink, LoaderCircle, Plus, Search } from "@/components/ui/glyphs";
import { ApiError, api, errorMessage, isAbortError, isApiError, paths } from "@/lib/api/client";
import { PickerFallback, sendableChannelOptions } from "@/components/dashboard/options";
import { ContentTypePicker } from "@/components/dashboard/editor/fields";
import { roleOptions } from "@/components/dashboard/editor/sections";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PlatformBadge } from "@/components/dashboard/avatars";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Field, inputClasses } from "@/components/ui/field";
import { useToast } from "@/components/dashboard/toast";
import { PlatformIcon } from "@/components/ui/icons";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, m } from "motion/react";
import { Callout } from "@/components/ui/callout";
import { mutate, useApi } from "@/lib/api/hooks";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EASE_OUT, spring } from "@/lib/motion";
import { premiumOnSale } from "@/lib/premium";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { safeUrl } from "@/lib/safe-url";
import Link from "next/link";
import cn from "@/lib/cn";


export function useAddCreatorLink(open: () => void) {
    const handler = useRef(open);
    handler.current = open;
    useEffect(() => {
        const listener = () => handler.current();
        window.addEventListener("oreo:add-creator", listener);
        const url = new URL(window.location.href);
        if (url.searchParams.get("add") === "creator") {
            handler.current();
            url.searchParams.delete("add");
            window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
        }
        return () => window.removeEventListener("oreo:add-creator", listener);
    }, []);
}


interface Props {
    open: boolean;
    onClose: () => void;
    guildId: string;
    overview: GuildOverview;
    resources: GuildResources | undefined;
    initialPlatform?: PlatformName;
}

type Lookup =
    | { state: "idle" }
    | { state: "loading" }
    | { state: "found", channel: LookupResult }
    | { state: "error", message: string };


export function AddCreatorDialog({ open, onClose, guildId, overview, resources, initialPlatform }: Props) {
    const router = useRouter();
    const toast = useToast();
    const inputId = useId();
    const helpId = useId();
    const channelLabel = useId();
    const roleLabel = useId();
    const typesLabel = useId();
    const input = useRef<HTMLInputElement>(null);

    const firstFree = PLATFORM_ORDER.find((item) => overview.limits.slots[item].used < overview.limits.slots[item].total) ?? "youtube";
    const [platform, setPlatform] = useState<PlatformName>(initialPlatform ?? firstFree);
    const [query, setQuery] = useState("");
    const [lookup, setLookup] = useState<Lookup>({ state: "idle" });
    const [channelId, setChannelId] = useState<string | null>(null);
    const [pingRoles, setPingRoles] = useState<string[]>([]);
    const [contentTypes, setContentTypes] = useState<ContentType[]>([...DEFAULT_YOUTUBE_CONTENT_TYPES]);
    const [submitting, setSubmitting] = useState(false);
    const [failure, setFailure] = useState<ApiError | null>(null);
    const [showErrors, setShowErrors] = useState(false);

    const guessed = useRef(false);
    useEffect(() => {
        if (!open) return;
        guessed.current = false;
        setPlatform(initialPlatform ?? firstFree);
        setQuery("");
        setLookup({ state: "idle" });
        setChannelId(null);
        setPingRoles([]);
        setContentTypes([...DEFAULT_YOUTUBE_CONTENT_TYPES]);
        setFailure(null);
        setShowErrors(false);
    }, [open]);

    const resourcesState = useApi<GuildResources>(open ? paths.resources(guildId) : null);
    const channelList = resources ?? resourcesState.data;
    useEffect(() => {
        if (!open || guessed.current || !channelList) return;
        guessed.current = true;
        const usable = new Set(channelList.channels.filter((item) => item.canSend && (item.type === "text" || item.type === "announcement")).map((item) => item.id));
        const counts = new Map<string, number>();
        for (const item of overview.creators) {
            if (item.channelId && usable.has(item.channelId)) counts.set(item.channelId, (counts.get(item.channelId) ?? 0) + 1);
        }
        const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        setChannelId((current) => current ?? common ?? null);
    }, [open, channelList, overview.creators]);

    const platformFull = overview.limits.slots[platform].used >= overview.limits.slots[platform].total;

    // Debounced, and skipped when there is no free slot to save the lookup budget
    useEffect(() => {
        const value = query.trim();
        setFailure(null);
        if (value.length < 2 || platformFull) {
            setLookup({ state: "idle" });
            return;
        }
        setLookup({ state: "loading" });
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const channel = await api.get<LookupResult>(paths.lookup(platform, value), { signal: controller.signal });
                setLookup({ state: "found", channel });
            } catch (error) {
                if (isAbortError(error)) return;
                setLookup({ state: "error", message: errorMessage(error) });
            }
        }, 400);
        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [query, platform, platformFull]);

    const channelOptions = useMemo(() => sendableChannelOptions(channelList), [channelList]);
    const pingOptions = useMemo(() => roleOptions(channelList, false), [channelList]);

    const slots = overview.limits.slots[platform];
    const full = slots.used >= slots.total;
    const upsell = !overview.limits.premium && premiumOnSale(overview.limits);
    const found = lookup.state === "found" ? lookup.channel : null;
    const existing = found
        ? overview.creators.find((item) => item.creator.platform === found.platform && item.creator.platformId === found.platformId)
        : undefined;
    const channel = channelId ? channelList?.channels.find((item) => item.id === channelId) : undefined;
    const channelMissing = Boolean(channelId && channelList && !channel);
    const canSubmit = Boolean(found) && !existing && !full && !submitting;

    const submit = async (event?: React.FormEvent) => {
        event?.preventDefault();
        setShowErrors(true);
        if (!canSubmit || !found || !channelId || channelMissing) return;
        setSubmitting(true);
        setFailure(null);

        let created: GuildCreator;
        try {
            created = await api.post<GuildCreator>(paths.creators(guildId), { platform, query: query.trim() });
        } catch (error) {
            setFailure(isApiError(error) ? error : new ApiError(0, "network", errorMessage(error)));
            setSubmitting(false);
            return;
        }

        let saved = created;
        let settled = true;
        try {
            const patch: Partial<Pick<GuildCreator, "channelId" | "pingRoles" | "contentTypes">> = { channelId };
            if (pingRoles.length) patch.pingRoles = pingRoles;
            if (platform === "youtube") patch.contentTypes = contentTypes;
            saved = await api.patch<GuildCreator>(paths.creator(guildId, created.id), patch);
        } catch (error) {
            settled = false;
            toast.error(error, { title: `Added ${created.creator.displayName}, but couldn't save the channel` });
        }

        mutate<GuildOverview>(paths.guild(guildId), (current) =>
            current && {
                ...current,
                creators: [...current.creators.filter((item) => item.id !== saved.id), saved],
                limits: {
                    ...current.limits,
                    slots: {
                        ...current.limits.slots,
                        [platform]: { ...current.limits.slots[platform], used: current.limits.slots[platform].used + 1 }
                    }
                }
            }
        );
        setSubmitting(false);
        onClose();

        const editor = `/dashboard/${guildId}/creators/${saved.id}`;
        if (!settled) {
            router.push(editor);
            return;
        }
        toast.success(`Added ${saved.creator.displayName}`, {
            description: channel ? `Oreo posts in #${channel.name} from now on.` : undefined,
            action: { label: "Customize the message", onClick: () => router.push(editor) }
        });
    };

    const hint = LOOKUP_HINTS[platform];
    const conflict = failure?.code === "conflict" ? (failure.details as GuildCreator | undefined) : undefined;
    const avatar = safeUrl(found?.avatarUrl);
    const profile = safeUrl(found?.url);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            dismissible={!submitting}
            title="Add a creator"
            description="Oreo posts in this server whenever they go live or upload."
            size="xl"
            initialFocus={input}
            footer={
                <>
                    <Button variant="secondary" size="lg" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="lg" type="submit" form="add-creator-form" disabled={!canSubmit}>
                        {submitting ? <LoaderCircle className="animate-spin" /> : <Plus />}
                        {found && !existing ? `Add ${found.displayName}` : "Add creator"}
                    </Button>
                </>
            }
        >
            <form id="add-creator-form" onSubmit={submit} className="space-y-5" noValidate>
                <fieldset>
                    <legend className="mb-1.5 text-sm font-medium text-paper/85">Platform</legend>
                    <PlatformPicker
                        value={platform}
                        overview={overview}
                        onChange={(next) => {
                            setPlatform(next);
                            input.current?.focus();
                        }}
                    />
                </fieldset>

                {full ? (
                    <Callout
                        tone="warning"
                        title={`No free ${platformName(platform)} slots (${slots.used}/${slots.total})`}
                        action={
                            upsell ? (
                                <Button href="/dashboard/premium" external variant="secondary" size="xs">
                                    <Crown />
                                    Get premium
                                </Button>
                            ) : undefined
                        }
                    >
                        Remove a {platformName(platform)} creator first{upsell ? ", or upgrade: premium servers get 25 per platform." : "."}
                    </Callout>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field label={hint.label} htmlFor={inputId} description={hint.help} descriptionId={helpId} required>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/50" aria-hidden="true" />
                                    <input
                                        ref={input}
                                        id={inputId}
                                        type="text"
                                        inputMode="url"
                                        value={query}
                                        maxLength={200}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder={hint.placeholder}
                                        autoComplete="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        aria-describedby={helpId}
                                        aria-invalid={(showErrors && !found) || lookup.state === "error" || undefined}
                                        className={cn(inputClasses, "h-10 pl-9")}
                                    />
                                </div>
                            </Field>

                            <div aria-live="polite" className="sm:pt-[1.625rem]">
                                <AnimatePresence mode="wait" initial={false}>
                                    <m.div
                                        key={lookup.state === "found" ? `found:${lookup.channel.platformId}` : lookup.state}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
                                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                    >
                                        {lookup.state === "idle" && (
                                            <div className="flex h-[4.25rem] items-center justify-center rounded-xl border border-dashed border-paper/10 px-4 text-center text-xs text-paper/50">
                                                The channel shows up here once it&apos;s found.
                                            </div>
                                        )}
                                        {lookup.state === "loading" && (
                                            <div className="flex h-[4.25rem] items-center gap-3 rounded-xl border border-paper/8 bg-ink-800/60 px-3" aria-label="Looking up the channel">
                                                <Skeleton className="size-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-3.5 w-1/2" />
                                                    <Skeleton className="h-3 w-1/3" />
                                                </div>
                                            </div>
                                        )}
                                        {lookup.state === "error" && (
                                            <div className="flex min-h-[4.25rem] items-center rounded-xl border border-bad/20 bg-bad/[0.05] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-bad-200)]" role="status">
                                                {lookup.message}
                                            </div>
                                        )}
                                        {found && (
                                            <div className="flex h-[4.25rem] items-center gap-3 rounded-xl border border-cream-400/20 bg-cream-500/[0.05] px-3">
                                                <span className="relative shrink-0">
                                                    <Avatar src={avatar} name={found.displayName} className="size-10 text-sm" eager />
                                                    <PlatformBadge platform={found.platform} className="absolute -bottom-0.5 -right-0.5 size-4 [&_svg]:size-2.5" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-semibold text-paper">{found.displayName}</span>
                                                        {existing && <Badge tone="warning">Already added</Badge>}
                                                    </p>
                                                    {existing ? (
                                                        <Link
                                                            href={`/dashboard/${guildId}/creators/${existing.id}`}
                                                            onClick={onClose}
                                                            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-cream-400 hover:text-cream-300"
                                                        >
                                                            Open their settings <ArrowRight className="size-3" />
                                                        </Link>
                                                    ) : profile ? (
                                                        <a
                                                            href={profile}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs text-paper/60 hover:text-paper"
                                                        >
                                                            <span className="truncate">@{found.username}</span>
                                                            <ExternalLink className="size-3 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="mt-0.5 block truncate text-xs text-paper/60">@{found.username}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </m.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="h-px bg-paper/[0.06]" />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field
                                label="Discord channel"
                                labelId={channelLabel}
                                required
                                error={
                                    showErrors && (!channelId || channelMissing)
                                        ? channelMissing
                                            ? "That channel doesn't exist anymore. Pick another one."
                                            : "Pick where the notifications go."
                                        : undefined
                                }
                                description={channel && !channel.canSend ? undefined : "Where the notifications are posted."}
                            >
                                {channelList ? (
                                    <Combobox
                                        value={channelId}
                                        onChange={setChannelId}
                                        options={channelOptions}
                                        placeholder="Pick a channel"
                                        searchPlaceholder="Search channels"
                                        emptyText="No text channels match."
                                        missingLabel="That channel doesn't exist anymore"
                                        searchable
                                        invalid={showErrors && (!channelId || channelMissing)}
                                        aria-labelledby={channelLabel}
                                    />
                                ) : (
                                    <PickerFallback error={resourcesState.error} onRetry={() => void resourcesState.reload().catch(() => null)} />
                                )}
                            </Field>

                            <Field label="Ping roles" labelId={roleLabel} optional description={`Mentioned in the message, up to ${MAX_PING_ROLES} roles. Change them, or set roles per kind of post, any time.`}>
                                {channelList ? (
                                    <MultiCombobox
                                        values={pingRoles}
                                        onChange={setPingRoles}
                                        options={pingOptions}
                                        max={MAX_PING_ROLES}
                                        placeholder="No ping roles"
                                        addLabel="Add role"
                                        searchPlaceholder="Search roles"
                                        missingLabel="Unknown role"
                                        aria-labelledby={roleLabel}
                                    />
                                ) : (
                                    <PickerFallback error={resourcesState.error} onRetry={() => void resourcesState.reload().catch(() => null)} />
                                )}
                            </Field>
                        </div>

                        {channel && !channel.canSend && (
                            <Callout tone="warning" title={`Oreo can't post in #${channel.name} yet`}>
                                Give Oreo View Channel, Send Messages and Embed Links there, or pick another channel.
                            </Callout>
                        )}

                        <AnimatePresence initial={false}>
                            {platform === "youtube" && (
                                <m.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1, transition: { height: spring.smooth, opacity: { duration: 0.2 } } }}
                                    exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
                                    className="overflow-hidden"
                                >
                                    <p id={typesLabel} className="mb-1.5 text-sm font-medium text-paper/85">Announce</p>
                                    <ContentTypePicker value={contentTypes} onChange={setContentTypes} options={PLATFORM_CONTENT_TYPES.youtube} labelledBy={typesLabel} />
                                </m.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {failure && (
                    <Callout
                        tone={failure.code === "no_slots" ? "warning" : "danger"}
                        role="alert"
                        title={failure.code === "no_slots" ? "No free slots" : failure.code === "conflict" ? "Already added" : "Couldn't add this creator"}
                        action={
                            failure.code === "no_slots" && upsell ? (
                                <Button href="/dashboard/premium" external variant="secondary" size="xs">
                                    <Crown />
                                    Get premium
                                </Button>
                            ) : conflict?.id ? (
                                <Button href={`/dashboard/${guildId}/creators/${conflict.id}`} variant="secondary" size="xs">
                                    Open it
                                </Button>
                            ) : undefined
                        }
                    >
                        {errorMessage(failure)}
                        {failure.code === "no_slots" && upsell && " Premium servers get 25 creators per platform."}
                    </Callout>
                )}
            </form>
        </Dialog>
    );
}


function PlatformPicker({ value, overview, onChange }: { value: PlatformName, overview: GuildOverview, onChange: (value: PlatformName) => void }) {
    return (
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Platform">
            {PLATFORM_ORDER.map((item) => {
                const active = item === value;
                const slots = overview.limits.slots[item];
                const full = slots.used >= slots.total;
                return (
                    <button
                        key={item}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        data-platform={item}
                        onClick={() => onChange(item)}
                        onKeyDown={(event) => {
                            const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
                            if (!step) return;
                            event.preventDefault();
                            const next = PLATFORM_ORDER[(PLATFORM_ORDER.indexOf(item) + step + PLATFORM_ORDER.length) % PLATFORM_ORDER.length]!;
                            onChange(next);
                            (event.currentTarget.parentElement?.querySelector(`[data-platform="${next}"]`) as HTMLElement | null)?.focus();
                        }}
                        className={cn(
                            "relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors duration-150",
                            active ? "border-transparent" : "border-paper/8 bg-ink-900 hover:border-paper/14 hover:bg-ink-800"
                        )}
                    >
                        {active && (
                            <m.span
                                layoutId="add-platform"
                                transition={spring.snappy}
                                className="absolute inset-0 rounded-xl border bg-ink-750"
                                style={{ borderColor: `${platformColor(item)}66`, boxShadow: `inset 0 0 0 1px ${platformColor(item)}22` }}
                                aria-hidden="true"
                            />
                        )}
                        <span className="relative" style={{ color: active ? platformColor(item) : undefined }}>
                            <PlatformIcon platform={item} className={cn("size-[1.125rem]", !active && "text-paper/55")} />
                        </span>
                        <span className="relative min-w-0">
                            <span className={cn("block text-sm font-medium", active ? "text-paper" : "text-paper/75")}>{platformName(item)}</span>
                            <span className={cn("block text-xs tabular-nums", full ? "text-warn" : "text-paper/50")}>
                                {full ? "No slots left" : `${slots.total - slots.used} of ${slots.total} free`}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

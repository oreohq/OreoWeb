"use client";

import { ArrowLeft, AtSign, ChevronRight, Eye, Hash, LoaderCircle, MessageSquare, MousePointerClick, PanelTop, Power, RadioTower, RotateCcw, Save, Settings2, Trash2, Wifi, WifiOff, ExternalLink } from "@/components/ui/glyphs";
import { allPingRoles, type ContentType, type EmbedConfig, type GuildCreator, type GuildOverview, type GuildResources } from "@/lib/api/types";
import { applyPatch, buildPatch, countChanges, upgradePatch, validate, type CreatorPatch } from "@/components/dashboard/editor/model";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PreviewPanel } from "@/components/dashboard/editor/preview";
import { mutate, useApi, type ApiState } from "@/lib/api/hooks";
import { CreatorAvatar } from "@/components/dashboard/avatars";
import { TOPBAR_OFFSET } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/dashboard/states";
import { useToast } from "@/components/dashboard/toast";
import { AnimatePresence, m } from "motion/react";
import { api, paths } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ButtonsSection,
    DangerZone,
    EmbedSection,
    GeneralSection,
    MessageSection,
    PingsSection,
    StreamEndSection
} from "@/components/dashboard/editor/sections";
import { CONTENT_TYPE_NAMES, PLATFORM_CONTENT_TYPES, platformName } from "@/lib/dashboard/platforms";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { smoothScrollTo } from "@/lib/scroll";
import { safeUrl } from "@/lib/safe-url";
import { spring } from "@/lib/motion";
import cn from "@/lib/cn";


const draftKey = (guildId: string, id: number) => `oreo:draft:${guildId}:${id}`;

function storeDraft(guildId: string, base: GuildCreator, patch: CreatorPatch) {
    try {
        window.sessionStorage.setItem(draftKey(guildId, base.id), JSON.stringify({ updatedAt: base.updatedAt, patch }));
    } catch {
        // Storage is full or blocked, so the edits just won't survive leaving the page
    }
}

function clearStoredDraft(guildId: string, id: number) {
    try {
        window.sessionStorage.removeItem(draftKey(guildId, id));
    } catch {
    }
}

function restoreDraft(guildId: string, base: GuildCreator): GuildCreator | null {
    try {
        const raw = window.sessionStorage.getItem(draftKey(guildId, base.id));
        if (!raw) return null;
        const stored = JSON.parse(raw) as { updatedAt?: string, patch?: CreatorPatch };
        if (stored.updatedAt !== base.updatedAt || !stored.patch || typeof stored.patch !== "object") {
            window.sessionStorage.removeItem(draftKey(guildId, base.id));
            return null;
        }
        return applyPatch(base, upgradePatch(stored.patch));
    } catch {
        return null;
    }
}


const removedIds = new Set<number>();

export function EditorPage({ guildId, creatorId }: { guildId: string, creatorId: number }) {
    const overview = useApi<GuildOverview>(paths.guild(guildId));
    const resources = useApi<GuildResources>(paths.resources(guildId));
    const base = overview.data?.creators.find((item) => item.id === creatorId);

    useEffect(() => {
        if (base) document.title = `${base.creator.displayName} · Oreo Dashboard`;
    }, [base]);

    useEffect(() => () => void removedIds.delete(creatorId), [creatorId]);

    if (!overview.data || (!base && removedIds.has(creatorId))) return <EditorSkeleton />;

    if (!base) {
        return (
            <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
                <EmptyState
                    title="This creator isn't here anymore"
                    description="They may have been removed from this server. Head back to the overview to see who's set up."
                    action={
                        <Button href={`/dashboard/${guildId}`} variant="secondary">
                            <ArrowLeft className="size-4" />
                            Back to overview
                        </Button>
                    }
                />
            </div>
        );
    }

    return <Editor key={base.id} guildId={guildId} base={base} overview={overview.data} resources={resources} />;
}


const SECTIONS = [
    { id: "general", label: "General", icon: <Settings2 /> },
    { id: "pings", label: "Pings & roles", icon: <AtSign /> },
    { id: "message", label: "Message", icon: <MessageSquare /> },
    { id: "embed", label: "Embed", icon: <PanelTop /> },
    { id: "buttons", label: "Buttons", icon: <MousePointerClick /> },
    { id: "stream-end", label: "Stream end", icon: <RadioTower /> },
    { id: "danger", label: "Danger zone", icon: <Trash2 /> }
];


function Editor({
    guildId,
    base,
    overview,
    resources
}: {
    guildId: string;
    base: GuildCreator;
    overview: GuildOverview;
    resources: ApiState<GuildResources>;
}) {
    const router = useRouter();
    const toast = useToast();
    const [draft, setDraft] = useState<GuildCreator>(() => restoreDraft(guildId, base) ?? base);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState<"messages" | "embed" | null>(null);
    const [confirmReset, setConfirmReset] = useState<"messages" | "embed" | null>(null);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [leaveTo, setLeaveTo] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [formKey, setFormKey] = useState(0);

    const types = PLATFORM_CONTENT_TYPES[base.creator.platform];
    const [type, setType] = useState<ContentType>(() =>
        types.length === 1 ? types[0]! : (["video", "live", "premiere", "shorts"] as ContentType[]).find((item) => base.contentTypes.includes(item)) ?? "video"
    );

    const previousBase = useRef(base);
    useEffect(() => {
        const before = previousBase.current;
        previousBase.current = base;
        setDraft((current) => (Object.keys(buildPatch(before, current)).length === 0 ? base : current));
    }, [base]);

    const patch = useMemo(() => buildPatch(base, draft), [base, draft]);
    const changes = countChanges(patch);
    const dirty = changes > 0;
    const errors = useMemo(() => validate(draft), [draft]);
    const errorCount = Object.keys(errors).length;
    const [tab, setTab] = useState(SECTIONS[0]!.id);
    const errorTabs = useMemo(() => new Set(Object.keys(errors).map(sectionOf)), [errors]);

    const set = useCallback(<K extends keyof GuildCreator>(key: K, value: GuildCreator[K]) => {
        setDraft((current) => ({ ...current, [key]: value }));
    }, []);
    const setEmbed = useCallback(<K extends keyof EmbedConfig>(key: K, value: EmbedConfig[K]) => {
        setDraft((current) => ({ ...current, embed: { ...current.embed, [key]: value } }));
    }, []);
    const setRoles = useCallback((changes: Partial<Pick<GuildCreator, "pingRoles" | "pingOverrides">>) => {
        setDraft((current) => {
            const next = { ...current, ...changes };
            return allPingRoles(next).length ? next : { ...next, notifyButton: false };
        });
    }, []);
    const setMessage = useCallback((messageType: ContentType, value: string) => {
        setDraft((current) => ({ ...current, messages: { ...current.messages, [messageType]: value } }));
    }, []);

    const replaceCreator = useCallback(
        (updated: GuildCreator) =>
            mutate<GuildOverview>(paths.guild(guildId), (current) =>
                current && { ...current, creators: current.creators.map((item) => (item.id === updated.id ? updated : item)) }
            ),
        [guildId]
    );

    const save = useCallback(async () => {
        if (!dirty || saving) return;
        if (errorCount) {
            toast.error(`Fix ${errorCount === 1 ? "the highlighted setting" : `the ${errorCount} highlighted settings`} first.`);
            return;
        }
        setSaving(true);
        const sent = draft;
        try {
            const updated = await api.patch<GuildCreator>(paths.creator(guildId, base.id), patch);
            setDraft((current) => (current === sent ? updated : applyPatch(updated, buildPatch(sent, current))));
            replaceCreator(updated);
            toast.success("Changes saved", { description: `${updated.creator.displayName}'s notifications are up to date.` });
        } catch (error) {
            toast.error(error, { title: "Couldn't save your changes" });
        } finally {
            setSaving(false);
        }
    }, [dirty, saving, errorCount, toast, guildId, base.id, patch, draft, replaceCreator]);

    const discard = () => {
        setDraft(base);
        setFormKey((key) => key + 1);
    };

    useEffect(() => {
        if (dirty) storeDraft(guildId, base, patch);
        else clearStoredDraft(guildId, base.id);
    }, [dirty, guildId, base, patch]);

    const restored = useRef(Object.keys(buildPatch(base, draft)).length > 0);
    useEffect(() => {
        if (!restored.current) return;
        restored.current = false;
        toast.info("Restored your unsaved changes", { description: "They're from your last visit to this page. Save them, or discard them." });
    }, []);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                void save();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [save]);

    useEffect(() => {
        if (!dirty) return;
        const beforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
            const url = new URL(anchor.href, window.location.href);
            // Leaving the site, so beforeunload asks instead
            if (url.origin !== window.location.origin) return;
            if (url.pathname === window.location.pathname && url.search === window.location.search) return;
            event.preventDefault();
            event.stopPropagation();
            setLeaveTo(`${url.pathname}${url.search}${url.hash}`);
        };
        window.addEventListener("beforeunload", beforeUnload);
        window.addEventListener("click", onClick, true);
        return () => {
            window.removeEventListener("beforeunload", beforeUnload);
            window.removeEventListener("click", onClick, true);
        };
    }, [dirty]);

    const reset = async () => {
        const part = confirmReset;
        if (!part) return;
        setResetting(part);
        try {
            const body = part === "messages" ? { part, type } : { part };
            const updated = await api.post<GuildCreator>(paths.creatorReset(guildId, base.id), body);
            setDraft((current) => part === "messages"
                ? { ...current, messages: { ...current.messages, [type]: updated.messages[type] }, updatedAt: updated.updatedAt }
                : { ...current, embed: updated.embed, updatedAt: updated.updatedAt });
            replaceCreator(updated);
            setFormKey((key) => key + 1);
            toast.success(part === "messages" ? `${CONTENT_TYPE_NAMES[type].one} message reset to Oreo's default` : "Embed reset to Oreo's defaults");
            setConfirmReset(null);
        } catch (error) {
            toast.error(error, { title: "Couldn't reset" });
        } finally {
            setResetting(null);
        }
    };

    const remove = async () => {
        setRemoving(true);
        try {
            await api.delete(paths.creator(guildId, base.id));
            removedIds.add(base.id);
            mutate<GuildOverview>(paths.guild(guildId), (current) =>
                current && {
                    ...current,
                    creators: current.creators.filter((item) => item.id !== base.id),
                    limits: {
                        ...current.limits,
                        slots: {
                            ...current.limits.slots,
                            [base.creator.platform]: {
                                ...current.limits.slots[base.creator.platform],
                                used: Math.max(0, current.limits.slots[base.creator.platform].used - 1)
                            }
                        }
                    }
                }
            );
            toast.success(`Removed ${base.creator.displayName}`);
            setConfirmRemove(false);
            clearStoredDraft(guildId, base.id);
            // replace, so Back doesn't lead to a creator that no longer exists
            router.replace(`/dashboard/${guildId}/creators`);
        } catch (error) {
            toast.error(error, { title: "Couldn't remove this creator" });
            setRemoving(false);
        }
    };

    const refreshResources = async () => {
        setRefreshing(true);
        try {
            await resources.reload(`${paths.resources(guildId)}?refresh=true`);
            toast.success("Channels and roles refreshed");
        } catch (error) {
            toast.error(error, { title: "Couldn't refresh channels and roles" });
        } finally {
            setRefreshing(false);
        }
    };

    const previewDraft = useMemo<GuildCreator>(
        () => (errors["embed.color"] ? { ...draft, embed: { ...draft.embed, color: null } } : draft),
        [draft, errors]
    );

    const { creator } = base;
    const profileUrl = safeUrl(creator.url);

    return (
        <div className="mx-auto w-full max-w-[80rem] px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-paper/60">
                <Link href={`/dashboard/${guildId}/creators`} className="rounded-md transition-colors hover:text-paper">
                    Creators
                </Link>
                <ChevronRight className="size-3.5 shrink-0 text-paper/40" aria-hidden="true" />
                <span className="truncate text-paper/75" aria-current="page">{creator.displayName}</span>
            </nav>

            <header className="panel mt-3 flex flex-col gap-5 rounded-2xl p-5 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <CreatorAvatar creator={creator} className="size-16 text-lg" badgeClassName="size-6 ring-[3px] [&_svg]:size-3.5" />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="truncate font-display text-[1.75rem] leading-tight tracking-tight text-paper sm:text-[2rem]">{creator.displayName}</h1>
                            {creator.subscriptionStatus === "pending" && <Badge tone="warning" icon={<Wifi />}>Connecting</Badge>}
                            {creator.subscriptionStatus === "failed" && <Badge tone="danger" icon={<WifiOff />}>Not connected</Badge>}
                        </div>
                        {profileUrl ? (
                            <a href={profileUrl} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-sm text-paper/65 transition-colors hover:text-paper">
                                @{creator.username} on {platformName(creator.platform)}
                                <ExternalLink className="size-3" />
                            </a>
                        ) : (
                            <p className="mt-0.5 text-sm text-paper/65">@{creator.username} on {platformName(creator.platform)}</p>
                        )}
                    </div>
                </div>
                <ul className="flex flex-wrap gap-2 lg:justify-end" aria-label="At a glance">
                    <QuickFact onSelect={() => setTab("general")} icon={<Power />} tone={draft.enabled ? "ok" : "muted"}>
                        {draft.enabled ? "Notifications on" : "Paused"}
                    </QuickFact>
                    <QuickFact onSelect={() => setTab("general")} icon={<Hash />} tone={draft.channelId ? "default" : "warn"}>
                        {draft.channelId
                            ? resources.data?.channels.find((channel) => channel.id === draft.channelId)?.name ?? "Channel picked"
                            : "No channel yet"}
                    </QuickFact>
                    <QuickFact onSelect={() => setTab("general")} icon={<MessageSquare />}>
                        {draft.contentTypes.length} {draft.contentTypes.length === 1 ? "kind of post" : "kinds of posts"}
                    </QuickFact>
                    <QuickFact onSelect={() => setTab("pings")} icon={<AtSign />}>
                        {allPingRoles(draft).length ? `${allPingRoles(draft).length} ping ${allPingRoles(draft).length === 1 ? "role" : "roles"}` : "No pings"}
                    </QuickFact>
                </ul>
            </header>

            <SectionNav active={tab} onChange={setTab} errorTabs={errorTabs} />

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(23rem,27rem)] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_30rem]">
                <aside id="preview" aria-label="Notification preview" className="min-w-0 scroll-mt-24 order-2">
                    <div className="xl:sticky xl:top-[7.5rem] xl:max-h-[calc(100svh-8.5rem)] xl:overflow-y-auto xl:overscroll-contain xl:rounded-2xl">
                        <PreviewPanel
                            guildId={guildId}
                            draft={previewDraft}
                            resources={resources.data}
                            type={type}
                            onTypeChange={setType}
                            dirty={dirty}
                        />
                    </div>
                </aside>

                <div className="order-1 min-w-0">
                    <div key={formKey} className="space-y-6">
                        {tab === "general" && (
                            <GeneralSection
                            draft={draft}
                            set={set}
                            resources={resources.data}
                            resourcesError={resources.data ? undefined : resources.error}
                            onRetryResources={() => void resources.reload().catch(() => null)}
                            errors={errors}
                            onRefreshResources={refreshResources}
                            refreshing={refreshing}
                        />
                        )}
                        {tab === "pings" && (
                            <PingsSection
                            draft={draft}
                            set={set}
                            setRoles={setRoles}
                            resources={resources.data}
                            resourcesError={resources.data ? undefined : resources.error}
                            onRetryResources={() => void resources.reload().catch(() => null)}
                            errors={errors}
                            guildId={guildId}
                        />
                        )}
                        {tab === "message" && (
                            <MessageSection
                            draft={draft}
                            setMessage={setMessage}
                            setRoles={setRoles}
                            resources={resources.data}
                            errors={errors}
                            type={type}
                            onTypeChange={setType}
                            onReset={() => setConfirmReset("messages")}
                        />
                        )}
                        {tab === "embed" && (
                            <EmbedSection draft={draft} setEmbed={setEmbed} errors={errors} onReset={() => setConfirmReset("embed")} />
                        )}
                        {tab === "buttons" && (
                            <ButtonsSection draft={draft} set={set} />
                        )}
                        {tab === "stream-end" && (
                            <StreamEndSection draft={draft} set={set} />
                        )}
                        {tab === "danger" && (
                            <DangerZone name={creator.displayName} onRemove={() => setConfirmRemove(true)} />
                        )}
                    </div>

                    <SaveBar
                        dirty={dirty}
                        changes={changes}
                        errorCount={errorCount}
                        saving={saving}
                        onSave={save}
                        onDiscard={discard}
                    />
                </div>
            </div>

            <PreviewJump />

            <ConfirmDialog
                open={confirmReset !== null}
                onClose={() => setConfirmReset(null)}
                onConfirm={reset}
                pending={resetting !== null}
                icon={<RotateCcw className="size-5" />}
                title={confirmReset === "embed" ? "Reset the embed?" : `Reset the ${CONTENT_TYPE_NAMES[type].one.toLowerCase()} message?`}
                description={
                    confirmReset === "embed"
                        ? "The embed goes back to Oreo's default look, right away. Other unsaved changes are kept."
                        : `The ${CONTENT_TYPE_NAMES[type].one.toLowerCase()} message goes back to Oreo's default, right away.${types.length > 1 ? " Messages for other kinds of posts" : " Other unsaved changes"} are kept.`
                }
                confirmLabel="Reset to default"
            />

            <ConfirmDialog
                open={confirmRemove}
                onClose={() => setConfirmRemove(false)}
                onConfirm={remove}
                pending={removing}
                title={`Remove ${creator.displayName}?`}
                description="Oreo stops posting about them here and deletes their settings and notification history. Counters showing them stay. This can't be undone."
                confirmLabel="Remove creator"
            />

            <ConfirmDialog
                open={leaveTo !== null}
                onClose={() => setLeaveTo(null)}
                onConfirm={() => {
                    const target = leaveTo;
                    setLeaveTo(null);
                    setDraft(base);
                    if (target) router.push(target);
                }}
                title="Leave without saving?"
                description={`You have ${changes} unsaved ${changes === 1 ? "change" : "changes"} for ${creator.displayName}. They'll be lost.`}
                confirmLabel="Discard & leave"
                cancelLabel="Keep editing"
            />
        </div>
    );
}


function SaveBar({
    dirty,
    changes,
    errorCount,
    saving,
    onSave,
    onDiscard
}: {
    dirty: boolean;
    changes: number;
    errorCount: number;
    saving: boolean;
    onSave: () => void;
    onDiscard: () => void;
}) {
    const shown = useRef(changes);
    if (changes > 0) shown.current = changes;
    const count = shown.current;

    return (
        <div className="pointer-events-none sticky bottom-3 z-30 mt-8 pb-3 sm:bottom-5">
            <AnimatePresence>
                {dirty && (
                    <m.div
                        role="region"
                        aria-label="Unsaved changes"
                        initial={{ y: 28, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1, transition: spring.smooth }}
                        exit={{ y: 20, opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
                        className="pointer-events-auto mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-cream-500/30 bg-ink-800 p-2.5 pl-3 shadow-[0_3px_0_var(--color-cocoa-950),0_24px_60px_-12px_rgb(0_0_0/0.85)] sm:flex-row sm:items-center"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span
                                className={cn("grid h-8 min-w-8 place-items-center rounded-lg px-2 font-display text-sm tabular-nums", errorCount ? "bg-bad/15 text-[var(--color-bad-300)]" : "bg-cream-500/15 text-cream-300")}
                                aria-hidden="true"
                            >
                                {count}
                            </span>
                            <p className="min-w-0 text-sm">
                                <span className="font-medium text-paper">
                                    Unsaved {count === 1 ? "change" : "changes"}
                                </span>
                                <span className="text-paper/60">
                                    {errorCount
                                        ? ` · fix ${errorCount === 1 ? "1 setting" : `${errorCount} settings`} to save`
                                        : " · already in the preview"}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="subtle" size="md" onClick={onDiscard} disabled={saving} className="flex-1 sm:flex-none">
                                Discard
                            </Button>
                            <Button variant="primary" size="md" onClick={onSave} disabled={saving || errorCount > 0} className="flex-1 sm:flex-none">
                                {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
                                {saving ? "Saving…" : "Save changes"}
                                <kbd className="ml-0.5 hidden rounded bg-[var(--color-cream-900)]/12 px-1 font-sans text-[0.625rem] font-semibold lg:inline">⌘S</kbd>
                            </Button>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}


function sectionOf(key: string) {
    if (key === "contentTypes" || key.startsWith("channelOverrides.")) return "general";
    if (key.startsWith("messages.") || key.startsWith("pingOverrides.")) return "message";
    if (key.startsWith("embed.")) return "embed";
    return "pings";
}

function SectionNav({ active, onChange, errorTabs }: { active: string, onChange: (id: string) => void, errorTabs: Set<string> }) {
    return (
        <nav
            id="settings-tabs"
            aria-label="Settings sections"
            className="sticky top-16 z-20 -mx-4 mt-4 border-b border-paper/[0.06] bg-ink-950/90 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
            <ul className="flex w-full gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SECTIONS.map((section) => (
                    <li key={section.id} className="shrink-0">
                        <a
                            href={`#${section.id}`}
                            aria-current={active === section.id ? "page" : undefined}
                            onClick={(event) => {
                                event.preventDefault();
                                onChange(section.id);
                                const nav = document.getElementById("settings-tabs");
                                if (nav && nav.getBoundingClientRect().top <= TOPBAR_OFFSET) smoothScrollTo("settings-tabs", { offset: TOPBAR_OFFSET });
                            }}
                            className={cn(
                                "relative flex h-9 items-center gap-2 whitespace-nowrap rounded-[0.625rem] px-3 text-sm font-medium transition-colors duration-150 [&_svg]:size-4",
                                section.id === "danger"
                                    ? "text-[var(--color-bad-300)]/70 hover:text-[var(--color-bad-300)]"
                                    : active === section.id
                                        ? "text-paper"
                                        : "text-paper/65 hover:bg-paper/[0.04] hover:text-paper/85"
                            )}
                        >
                            {active === section.id && (
                                <m.span
                                    layoutId="editor-section"
                                    transition={spring.snappy}
                                    className={cn(
                                        "absolute inset-0 rounded-[0.625rem] border",
                                        section.id === "danger" ? "border-bad/25 bg-bad/10" : "raised-depth border-paper/[0.08] bg-ink-750"
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                            <span className={cn("relative", active === section.id && section.id !== "danger" ? "text-cream-400" : "opacity-70")} aria-hidden="true">{section.icon}</span>
                            <span className="relative">{section.label}</span>
                            {errorTabs.has(section.id) && <span className="relative size-1.5 rounded-full bg-[var(--color-bad-300)]" aria-label="Has a problem" />}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}


function PreviewJump() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => {
            const box = document.getElementById("preview")?.getBoundingClientRect();
            setVisible(!!box && window.scrollY > 240 && (box.top > window.innerHeight || box.bottom < 0));
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    if (!visible) return null;
    return (
        <button
            type="button"
            onClick={() => smoothScrollTo("preview", { offset: TOPBAR_OFFSET })}
            className="popover-in fixed right-4 top-[7.25rem] z-40 flex items-center gap-2 rounded-full border border-cream-400/20 bg-ink-850 px-4 py-2 text-sm font-semibold text-paper shadow-xl shadow-black/60 backdrop-blur-xl xl:hidden"
        >
            <Eye className="size-4 text-cream-400" />
            Preview
        </button>
    );
}


function EditorSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[80rem] px-4 pt-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading creator">
            <Skeleton className="h-5 w-24" />
            <div className="mt-5 flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-9 w-56" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_27rem]">
                <div className="space-y-6 xl:order-1">
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="panel rounded-2xl p-6">
                            <div className="flex items-center gap-3.5">
                                <Skeleton className="size-10 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3.5 w-56" />
                                </div>
                            </div>
                            <Skeleton className="mt-6 h-11 w-full rounded-xl" />
                            <Skeleton className="mt-4 h-11 w-2/3 rounded-xl" />
                        </div>
                    ))}
                </div>
                <div className="panel h-96 rounded-2xl p-5 xl:order-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-5 h-8 w-64 rounded-xl" />
                    <Skeleton className="mt-5 h-56 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}


function QuickFact({ onSelect, icon, tone = "default", children }: { onSelect: () => void, icon: React.ReactNode, tone?: "default" | "ok" | "warn" | "muted", children: React.ReactNode }) {
    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                className={cn(
                    "flex h-8 max-w-56 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors [&_svg]:size-3.5 [&_svg]:shrink-0",
                    tone === "ok" && "border-ok/25 bg-ok/10 text-ok hover:bg-ok/15",
                    tone === "warn" && "border-warn/25 bg-warn/10 text-warn hover:bg-warn/15",
                    tone === "muted" && "border-paper/10 bg-paper/[0.04] text-paper/70 hover:text-paper",
                    tone === "default" && "border-paper/10 bg-paper/[0.04] text-paper/75 hover:border-paper/20 hover:text-paper"
                )}
            >
                {icon}
                <span className="truncate">{children}</span>
            </button>
        </li>
    );
}

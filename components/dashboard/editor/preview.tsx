"use client";

import { AtSign, BellOff, CircleCheck, CircleX, ExternalLink, FlaskConical, Hash, LoaderCircle, Megaphone, Trash, WifiOff } from "@/components/ui/glyphs";
import type { ContentType, GuildCreator, GuildResources, TestResult } from "@/lib/api/types";
import { renderNotification, type NotificationState } from "@/lib/notification/render";
import { CONTENT_TYPE_NAMES, PLATFORM_CONTENT_TYPES } from "@/lib/dashboard/platforms";
import type { MarkdownContext } from "@/components/dashboard/discord/markdown";
import { sampleContent, type PreviewState } from "@/lib/dashboard/sample";
import { DiscordMessage } from "@/components/dashboard/discord/message";
import { contentIcon } from "@/components/dashboard/editor/fields";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, errorMessage, paths } from "@/lib/api/client";
import { PLATFORM_ICONS } from "@/lib/notification/emojis";
import { useToast } from "@/components/dashboard/toast";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import cn from "@/lib/cn";


interface Props {
    guildId: string;
    draft: GuildCreator;
    resources: GuildResources | undefined;
    type: ContentType;
    onTypeChange: (type: ContentType) => void;
    dirty: boolean;
}

export function PreviewPanel({ guildId, draft, resources, type, onTypeChange, dirty }: Props) {
    const [state, setState] = useState<PreviewState>("live");
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(timer);
    }, []);

    const types = PLATFORM_CONTENT_TYPES[draft.creator.platform];
    const isStream = type === "live";
    const ended = isStream && state === "ended";
    const renderState: NotificationState = !isStream ? "published" : ended && draft.onStreamEnd === "edit" ? "ended" : "live";

    const content = useMemo(() => sampleContent(draft.creator, type, state, now), [draft.creator, type, state, now]);
    const message = useMemo(() => renderNotification({ guildCreator: draft, content, state: renderState, now, icons: PLATFORM_ICONS }), [draft, content, renderState, now]);

    const context = useMemo<MarkdownContext>(
        () => ({
            roles: new Map((resources?.roles ?? []).map((role) => [role.id, { name: role.name, color: role.color }])),
            channels: new Map((resources?.channels ?? []).map((channel) => [channel.id, { name: channel.name }])),
            now
        }),
        [resources, now]
    );

    const channel = draft.channelId ? resources?.channels.find((item) => item.id === draft.channelId) : undefined;
    const pings = describePings(message.allowedMentions, resources);
    const sentAt = Date.parse(content.startedAt) + (isStream ? 5_000 : 2_000);

    return (
        <div className="panel overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper/6 px-4 py-3 sm:px-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-paper">
                    Live preview
                    <span className="flex items-center gap-1.5 text-xs font-normal text-paper/55">
                        <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
                        updates as you type
                    </span>
                </h2>
            </div>

            <div className="space-y-3 px-4 pt-4 sm:px-5">
                <div className="flex flex-wrap gap-2">
                    {types.length > 1 && (
                        <Segmented
                            label="Preview a"
                            size="sm"
                            value={type}
                            onChange={onTypeChange}
                            options={types.map((item) => ({ value: item, label: CONTENT_TYPE_NAMES[item].one, icon: contentIcon(item, "size-3.5") }))}
                        />
                    )}
                    {isStream && (
                        <Segmented
                            label="Stream state"
                            size="sm"
                            value={state}
                            onChange={setState}
                            options={[
                                { value: "live", label: "Live" },
                                { value: "ended", label: "Ended" }
                            ]}
                        />
                    )}
                </div>
                {!draft.contentTypes.includes(type) && (
                    <p className="flex items-center gap-2 rounded-xl border border-warn/20 bg-warn/8 px-3 py-2 text-xs text-warn">
                        <BellOff className="size-3.5 shrink-0" />
                        {CONTENT_TYPE_NAMES[type].many} are switched off, so this wouldn&apos;t be posted.
                    </p>
                )}
            </div>

            <div className="m-3 overflow-hidden rounded-xl border border-paper/6 bg-[#1a1b20] sm:m-4">
                <div className="flex items-center gap-2 border-b border-black/30 px-4 py-2.5 text-sm">
                    {channel?.type === "announcement" ? (
                        <Megaphone className="size-4 text-[#80848E]" aria-hidden="true" />
                    ) : (
                        <Hash className="size-4 text-[#80848E]" aria-hidden="true" />
                    )}
                    <span className={cn("font-semibold", channel ? "text-[#F2F3F5]" : "italic text-[#949BA4]")}>
                        {channel?.name ?? (draft.channelId ? "unknown-channel" : "no channel picked")}
                    </span>
                </div>
                <div className="px-3 py-3 sm:px-4" aria-live="off">
                    {ended && draft.onStreamEnd === "delete" ? (
                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#4E5058] px-4 py-5 text-sm text-[#949BA4]">
                            <Trash className="size-4 shrink-0" />
                            Oreo deletes the message when the stream ends.
                        </div>
                    ) : (
                        <>
                            <DiscordMessage message={message} context={context} edited={ended && draft.onStreamEnd === "edit"} sentAt={sentAt} />
                            {ended && draft.onStreamEnd === "keep" && (
                                <p className="mt-2 text-xs text-[#949BA4]">The live message stays as it was when the stream ends.</p>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-start gap-2 px-4 text-xs text-paper/65 sm:px-5">
                <AtSign className="mt-px size-3.5 shrink-0 text-paper/50" aria-hidden="true" />
                <p>{pings}</p>
            </div>

            <TestPanel guildId={guildId} creator={draft} dirty={dirty} channelName={channel?.name} />
        </div>
    );
}


function describePings(mentions: { parse: string[], roles: string[], users: string[] }, resources: GuildResources | undefined) {
    const names = [
        ...(mentions.parse.includes("everyone") ? ["@everyone / @here"] : []),
        ...mentions.roles.map((id) => `@${resources?.roles.find((role) => role.id === id)?.name ?? "role"}`),
        ...(mentions.users.length ? [`${mentions.users.length} member${mentions.users.length === 1 ? "" : "s"}`] : [])
    ];
    return names.length ? `Pings ${names.join(", ")} when it's posted.` : "Doesn't ping anyone.";
}


type TestState =
    | { status: "idle" }
    | { status: "running", since: number }
    | { status: "sent", url: string | null }
    | { status: "failed", error: string }
    | { status: "timeout" };

const POLL_MS = 1000;
const POLL_LIMIT = 20;

function TestPanel({ guildId, creator, dirty, channelName }: { guildId: string, creator: GuildCreator, dirty: boolean, channelName?: string }) {
    const toast = useToast();
    const [test, setTest] = useState<TestState>({ status: "idle" });
    const [elapsed, setElapsed] = useState(0);
    const alive = useRef(true);

    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    useEffect(() => {
        if (test.status !== "running") return;
        const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - test.since) / 1000)), 500);
        return () => window.clearInterval(timer);
    }, [test]);

    const blocked = dirty ? "Save your changes first. Tests use the saved settings." : !creator.channelId ? "Pick a channel and save first." : null;

    const run = async () => {
        if (blocked || test.status === "running") return;
        setElapsed(0);
        setTest({ status: "running", since: Date.now() });
        try {
            const { requestId } = await api.post<{ requestId: string }>(paths.creatorTest(guildId, creator.id));
            for (let attempt = 0; attempt < POLL_LIMIT; attempt++) {
                await new Promise((resolve) => window.setTimeout(resolve, POLL_MS));
                if (!alive.current) return;
                const result = await api.get<TestResult>(paths.test(guildId, requestId));
                if (result.status === "sent") {
                    setTest({ status: "sent", url: result.messageUrl ?? null });
                    toast.success("Test notification sent", {
                        description: channelName ? `Check #${channelName}.` : undefined,
                        action: result.messageUrl ? { label: "Open in Discord", href: result.messageUrl, external: true } : undefined
                    });
                    return;
                }
                if (result.status === "failed") {
                    const error = result.error || "Discord refused the message.";
                    setTest({ status: "failed", error });
                    toast.error(error, { title: "The test didn't go through" });
                    return;
                }
            }
            if (alive.current) setTest({ status: "timeout" });
        } catch (error) {
            if (!alive.current) return;
            setTest({ status: "failed", error: errorMessage(error) });
            toast.error(error, { title: "Couldn't send a test" });
        }
    };

    return (
        <div className="mt-4 border-t border-paper/6 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={run}
                    disabled={Boolean(blocked) || test.status === "running"}
                    aria-describedby="test-hint"
                >
                    {test.status === "running" ? <LoaderCircle className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
                    {test.status === "running" ? "Sending…" : "Send test notification"}
                </Button>
                <p id="test-hint" className="min-w-0 flex-1 text-xs leading-relaxed text-paper/55">
                    {blocked ?? `Posts silently in ${channelName ? `#${channelName}` : "the channel"}, nobody is pinged.`}
                </p>
            </div>

            <div aria-live="polite">
                {test.status === "running" && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-paper/70">
                        <span className="relative flex size-2" aria-hidden="true">
                            <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-cream-400" />
                            <span className="relative inline-flex size-2 rounded-full bg-cream-400" />
                        </span>
                        Waiting for Oreo to post it… {elapsed > 0 && <span className="tabular-nums">{elapsed}s</span>}
                    </p>
                )}
                {test.status === "sent" && (
                    <p className="popover-in mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-ok/20 bg-ok/8 px-3 py-2 text-xs text-ok">
                        <CircleCheck className="size-4 shrink-0" />
                        Sent{channelName ? ` to #${channelName}` : ""}.
                        {test.url && (
                            <a href={test.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-ok underline-offset-2 hover:underline">
                                Open in Discord <ExternalLink className="size-3" />
                            </a>
                        )}
                    </p>
                )}
                {test.status === "failed" && (
                    <p className="popover-in mt-3 flex items-start gap-2 rounded-xl border border-bad/20 bg-bad/8 px-3 py-2 text-xs leading-relaxed text-[var(--color-bad-300)]">
                        <CircleX className="mt-px size-4 shrink-0" />
                        {test.error}
                    </p>
                )}
                {test.status === "timeout" && (
                    <p className="popover-in mt-3 flex items-start gap-2 rounded-xl border border-warn/20 bg-warn/8 px-3 py-2 text-xs leading-relaxed text-warn">
                        <WifiOff className="mt-px size-4 shrink-0" />
                        Oreo didn&apos;t respond in time. The bot may be offline or restarting. Try again in a minute.
                    </p>
                )}
            </div>
        </div>
    );
}

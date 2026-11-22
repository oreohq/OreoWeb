"use client";

import { Crown, ImagePlus, LoaderCircle, RotateCcw, Trash2 } from "@/components/ui/glyphs";
import { CharCount, Field, Input, Textarea } from "@/components/ui/field";
import { ErrorState, PageHeader } from "@/components/dashboard/states";
import type { BotProfile, BotProfilePatch } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { api, errorMessage, paths } from "@/lib/api/client";
import { useEffect, useId, useRef, useState } from "react";
import { useToast } from "@/components/dashboard/toast";
import { revalidate, useApi } from "@/lib/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { premiumEnabled } from "@/lib/premium";
import { Badge } from "@/components/ui/badge";
import cn from "@/lib/cn";


const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

type ImageDraft = { kind: "keep" } | { kind: "new", dataUri: string, name: string } | { kind: "reset" };

interface Draft {
    nick: string;
    bio: string;
    avatar: ImageDraft;
    banner: ImageDraft;
}

const KEEP: ImageDraft = { kind: "keep" };

function draftOf(profile: BotProfile): Draft {
    return { nick: profile.nick ?? "", bio: profile.bio ?? "", avatar: KEEP, banner: KEEP };
}

/** Only fields that differ from the saved ones, because Discord limits each change */
function patchOf(profile: BotProfile, draft: Draft): BotProfilePatch {
    const patch: BotProfilePatch = {};
    const nick = draft.nick.trim();
    const bio = draft.bio.trim();
    if (nick !== (profile.nick ?? "")) patch.nick = nick || null;
    if (bio !== (profile.bio ?? "")) patch.bio = bio || null;
    if (draft.avatar.kind === "new") patch.avatar = draft.avatar.dataUri;
    if (draft.avatar.kind === "reset" && profile.avatarUrl) patch.avatar = null;
    if (draft.banner.kind === "new") patch.banner = draft.banner.dataUri;
    if (draft.banner.kind === "reset" && profile.bannerUrl) patch.banner = null;
    return patch;
}

function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Couldn't read that file."));
        reader.readAsDataURL(file);
    });
}


export function ProfilePage({ guildId }: { guildId: string }) {
    const profile = useApi<BotProfile>(paths.botProfile(guildId));
    const toast = useToast();
    const [draft, setDraft] = useState<Draft | null>(null);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const data = profile.data;

    const savedImage = (which: "avatar" | "banner") =>
        data?.saved[which] && !data[which === "avatar" ? "avatarUrl" : "bannerUrl"] ? `${paths.botProfileImage(guildId, which)}?v=${encodeURIComponent(data.saved.at ?? "")}` : null;
    const view = data ? { ...data, avatarUrl: data.avatarUrl ?? savedImage("avatar"), bannerUrl: data.bannerUrl ?? savedImage("banner") } : undefined;

    const savedKey = data ? JSON.stringify([data.nick, data.bio, data.avatarUrl, data.bannerUrl, data.saved]) : "";
    useEffect(() => {
        if (view) setDraft(draftOf(view));
    }, [savedKey]);

    const change = (changes: Partial<Draft>) => setDraft((current) => (current ? { ...current, ...changes } : current));

    const patch = view && draft ? patchOf(view, draft) : {};
    const dirty = Object.keys(patch).length > 0;
    const customised = Boolean(data && (data.nick || data.bio || data.avatarUrl || data.bannerUrl || data.saved.avatar || data.saved.banner));
    const locked = !data?.premium;
    const save = async () => {
        if (!dirty || saving) return;
        setSaving(true);
        try {
            profile.mutate(await api.put<BotProfile>(paths.botProfile(guildId), patch));
            void revalidate(paths.guild(guildId));
            toast.success("Oreo's profile was updated", { description: "It can take a moment to show in Discord." });
        } catch (error) {
            toast.error(error, { title: "Couldn't update the profile" });
        } finally {
            setSaving(false);
        }
    };

    const reset = async () => {
        setResetting(true);
        try {
            profile.mutate(await api.delete<BotProfile>(paths.botProfile(guildId)));
            setConfirmReset(false);
            toast.success("The profile was deleted", { description: "Oreo is back to its own name and picture." });
        } catch (error) {
            toast.error(error, { title: "Couldn't reset the profile" });
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-[60rem] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            <PageHeader
                title="Bot profile"
                description="Give Oreo its own name, picture, banner and bio in this server."
                meta={<Badge tone="cream" icon={<Crown />}>Premium</Badge>}
                actions={
                    customised ? (
                        <Button variant="secondary" size="lg" onClick={() => setConfirmReset(true)} disabled={saving}>
                            <RotateCcw />
                            Delete profile
                        </Button>
                    ) : undefined
                }
            />

            <div className="mt-7 border-t border-paper/[0.06] pt-7" aria-busy={profile.loading}>
                {profile.loading && <FormSkeleton />}
                {!data && profile.error && <ErrorState error={profile.error} title="Couldn't load Oreo's profile" onRetry={() => profile.reload()} />}

                {data && draft && (
                    <div className="space-y-6">
                        {locked && (
                            <Callout
                                tone="cream"
                                icon={<Crown />}
                                title="This is a premium feature"
                                action={premiumEnabled ? <Button variant="primary" size="sm" href="/dashboard/premium">Give this server premium</Button> : undefined}
                            >
                                {customised
                                    ? "Oreo is back to its own name and picture here. Your profile below is saved, and comes back as soon as this server has premium again."
                                    : "Servers with premium can rename Oreo and give it its own picture and banner."}
                            </Callout>
                        )}

                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void save();
                                }}
                                className="panel space-y-5 rounded-2xl p-5 sm:p-6"
                            >
                                <NickField value={draft.nick} onChange={(nick) => change({ nick })} limit={data.limits.nick} placeholder={data.default.username} disabled={locked || saving} />
                                <BioField value={draft.bio} onChange={(bio) => change({ bio })} limit={data.limits.bio} disabled={locked || saving} />
                                <ImageField
                                    label="Picture"
                                    hint="Square works best. PNG, JPEG, GIF or WebP."
                                    maxBytes={data.limits.avatarBytes}
                                    current={view!.avatarUrl}
                                    draft={draft.avatar}
                                    onChange={(avatar) => change({ avatar })}
                                    disabled={locked || saving}
                                    round
                                />
                                <ImageField
                                    label="Banner"
                                    hint="Wide images work best (about 3:1)."
                                    maxBytes={data.limits.bannerBytes}
                                    current={view!.bannerUrl}
                                    draft={draft.banner}
                                    onChange={(banner) => change({ banner })}
                                    disabled={locked || saving}
                                />

                                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-paper/[0.06] pt-4">
                                    {dirty && (
                                        <Button variant="subtle" size="md" onClick={() => setDraft(draftOf(view!))} disabled={saving}>
                                            Discard changes
                                        </Button>
                                    )}
                                    <Button variant="primary" size="md" type="submit" disabled={!dirty || saving || locked}>
                                        {saving && <LoaderCircle className="animate-spin" />}
                                        Save profile
                                    </Button>
                                </div>
                            </form>

                            <Preview profile={view!} draft={draft} />
                        </div>

                        <p className="text-xs leading-relaxed text-paper/55">
                            Discord limits how often a profile can change, so changes are limited to a few an hour. Oreo&apos;s nickname needs the
                            Change Nickname permission; its picture, banner and bio don&apos;t.
                        </p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmReset}
                onClose={() => setConfirmReset(false)}
                onConfirm={reset}
                pending={resetting}
                icon={<RotateCcw className="size-5" />}
                title="Delete this profile?"
                description="Oreo goes back to its own name, picture, banner and bio here, and the saved copy is deleted, so it won't come back with premium."
                confirmLabel="Delete profile"
            />
        </div>
    );
}


function NickField({ value, onChange, limit, placeholder, disabled }: { value: string, onChange: (value: string) => void, limit: number, placeholder: string, disabled: boolean }) {
    const id = useId();
    return (
        <Field label="Name" htmlFor={id} aside={<CharCount value={value.length} max={limit} />} description="Shown in this server instead of Oreo. Leave empty to keep Oreo's own name.">
            <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} maxLength={limit} placeholder={placeholder} disabled={disabled} autoComplete="off" />
        </Field>
    );
}

function BioField({ value, onChange, limit, disabled }: { value: string, onChange: (value: string) => void, limit: number, disabled: boolean }) {
    const id = useId();
    return (
        <Field label="Bio" htmlFor={id} optional aside={<CharCount value={value.length} max={limit} />}>
            <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} maxLength={limit} rows={3} disabled={disabled} className="min-h-20" />
        </Field>
    );
}

function ImageField({
    label,
    hint,
    maxBytes,
    current,
    draft,
    onChange,
    disabled,
    round
}: {
    label: string;
    hint: string;
    maxBytes: number;
    current: string | null;
    draft: ImageDraft;
    onChange: (draft: ImageDraft) => void;
    disabled: boolean;
    round?: boolean;
}) {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const shown = draft.kind === "new" ? draft.dataUri : draft.kind === "reset" ? null : current;

    const pick = async (file: File | undefined) => {
        if (!file) return;
        setError(null);
        if (!IMAGE_TYPES.includes(file.type)) return setError("Pick a PNG, JPEG, GIF or WebP image.");
        if (file.size > maxBytes) return setError(`That's too big: ${Math.round(maxBytes / 1024 / 1024)} MB at most.`);
        try {
            onChange({ kind: "new", dataUri: await readImage(file), name: file.name });
        } catch (failure) {
            setError(errorMessage(failure, "Couldn't read that file."));
        }
    };

    return (
        <Field label={label} htmlFor={id} description={hint} error={error}>
            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        "grid shrink-0 place-items-center overflow-hidden border border-paper/10 bg-ink-800 text-paper/45",
                        round ? "size-16 rounded-full" : "h-16 w-32 rounded-xl"
                    )}
                >
                    {shown ? <img src={shown} alt="" className="size-full object-cover" /> : <ImagePlus className="size-5" aria-hidden="true" />}
                </span>
                <div className="flex flex-wrap gap-2">
                    <input
                        ref={input}
                        id={id}
                        type="file"
                        accept={IMAGE_TYPES.join(",")}
                        className="sr-only"
                        disabled={disabled}
                        onChange={(event) => {
                            void pick(event.target.files?.[0]);
                            event.target.value = "";
                        }}
                    />
                    <Button variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={disabled}>
                        <ImagePlus />
                        {shown ? "Change" : "Upload"}
                    </Button>
                    {(shown || draft.kind === "new") && (
                        <Button variant="subtle" size="sm" onClick={() => onChange(draft.kind === "new" ? KEEP : { kind: "reset" })} disabled={disabled}>
                            <Trash2 />
                            {draft.kind === "new" ? "Undo" : "Remove"}
                        </Button>
                    )}
                </div>
            </div>
            {draft.kind === "new" && <p className="mt-1.5 truncate text-xs text-paper/55">{draft.name}</p>}
        </Field>
    );
}


function Preview({ profile, draft }: { profile: BotProfile, draft: Draft }) {
    const name = draft.nick.trim() || profile.default.username;
    const avatar = draft.avatar.kind === "new" ? draft.avatar.dataUri : draft.avatar.kind === "reset" ? null : profile.avatarUrl;
    const banner = draft.banner.kind === "new" ? draft.banner.dataUri : draft.banner.kind === "reset" ? null : profile.bannerUrl;
    const bio = draft.bio.trim();

    return (
        <aside aria-label="Preview" className="lg:sticky lg:top-24">
            <p className="mb-2 text-sm font-medium text-paper/65">Preview</p>
            <div className="overflow-hidden rounded-2xl border border-paper/[0.08] bg-ink-900">
                <div className="h-24 bg-ink-700">
                    {banner && <img src={banner} alt="" className="size-full object-cover" />}
                </div>
                <div className="px-4 pb-4">
                    <PreviewAvatar src={avatar ?? profile.default.avatarUrl} name={name} />
                    <p className="mt-2 flex items-center gap-2">
                        <span className="truncate font-display text-xl text-paper">{name}</span>
                        <span className="rounded bg-blurple px-1 py-px text-[0.625rem] font-semibold uppercase tracking-wide text-white">App</span>
                    </p>
                    <div className="mt-3 rounded-xl bg-ink-850 p-3 text-sm leading-relaxed text-paper/70">
                        {bio ? <p className="whitespace-pre-wrap break-words">{bio}</p> : <p className="text-paper/50">No bio</p>}
                    </div>
                </div>
            </div>
        </aside>
    );
}


function PreviewAvatar({ src, name }: { src: string | null, name: string }) {
    const className = "-mt-9 size-[4.5rem] border-[5px] border-ink-900 text-lg";
    if (src?.startsWith("data:image/") || src?.startsWith("/api/v1/dashboard/")) {
        return <img src={src} alt="" className={cn("rounded-full bg-ink-700 object-cover", className)} />;
    }
    return <Avatar src={src} name={name} className={className} />;
}


function FormSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-hidden="true">
            <div className="panel space-y-5 rounded-2xl p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    );
}

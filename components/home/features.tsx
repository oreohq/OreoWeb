import { ArrowRight, BellRing, Clapperboard, Cookie, ExternalLink, Moon, Volume2 } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { PlatformIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import Image from "next/image";
import cn from "@/lib/cn";


// Made-up creators, each with its own little logo
const CREATORS = {
    "Oreo HQ": { icon: Clapperboard, color: "bg-cream-400 text-cocoa-850" },
    "Cocoa Crumbs": { icon: Cookie, color: "bg-[#6B4A3A] text-cream-200" },
    "Midnight Milk": { icon: Moon, color: "bg-[#33405C] text-[#C9D6F2]" }
};

type CreatorName = keyof typeof CREATORS;


export function Features() {
    return (
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-28 sm:px-8">
            <SectionHeading
                eyebrow="Features"
                title="Everything a go-live needs"
                description="The small things that make a notification channel people actually keep unmuted."
            />

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Card
                    className="md:col-span-2"
                    title="Posts that keep up"
                    body="When the title changes or the stream ends, Oreo edits the message it already sent: the embed turns grey and the button points to the recording. Or have it delete the post instead."
                >
                    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                        <MiniEmbed color="#9146FF" footer="Live now" button="Watch Stream" />
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cocoa-700 text-cream-100/50">
                            <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
                        </span>
                        <MiniEmbed color="#4E5058" footer="Stream ended" button="Watch the VOD" ended />
                    </div>
                </Card>

                <Card
                    delay={80}
                    title="Pings people want"
                    body="Ping a role per creator. With the Notify me button, members give themselves that role in one click."
                >
                    <Message>
                        <Mention>@Twitch Pings</Mention> Cocoa Crumbs is live!
                        <span className="mt-2 flex h-7 w-fit items-center gap-1.5 rounded-md bg-[#4E5058] px-3 text-[0.72rem] font-medium text-white">
                            <BellRing className="size-3.5" /> Notify me
                        </span>
                    </Message>
                </Card>

                <Card
                    delay={40}
                    title="Your words, your embed"
                    body="Rewrite the message and the embed with placeholders. The dashboard previews exactly what will post."
                >
                    <div className="w-full max-w-[17rem] space-y-2">
                        <p className="rounded-lg border border-cream-200/8 bg-cocoa-850 px-3 py-2 font-mono text-[0.7rem] leading-relaxed text-cream-100/50 shadow-lg shadow-black/30">
                            <Token>{"{role.pingrole}"}</Token> <Token>{"{channel.name}"}</Token> is live: <Token>{"{video.title}"}</Token>
                        </p>
                        <p className="rounded-lg bg-[#313338] px-3 py-2 text-[0.75rem] leading-relaxed text-[#DBDEE1] shadow-lg shadow-black/30">
                            <Mention>@Twitch Pings</Mention> Cocoa Crumbs is live: Late-night build, come hang
                        </p>
                    </div>
                </Card>

                <Card
                    delay={100}
                    title="Live counters"
                    body="Turn a voice channel into a subscriber or follower count that keeps itself up to date."
                >
                    <div className="w-full max-w-[15rem] rounded-lg bg-[#2B2D31] p-2 text-[0.8rem] shadow-lg shadow-black/30">
                        <p className="px-1.5 pb-1 text-[0.62rem] font-semibold uppercase tracking-wide text-[#949BA4]">Stats</p>
                        <VoiceChannel platform="youtube">412K subscribers</VoiceChannel>
                        <VoiceChannel platform="twitch">88.2K followers</VoiceChannel>
                        <VoiceChannel platform="kick">23.9K followers</VoiceChannel>
                    </div>
                </Card>

                <Card
                    delay={160}
                    title="A role while they're live"
                    body="Give a creator a role for as long as they're streaming, so they sit at the top of the member list."
                >
                    <div className="w-full max-w-[15rem] rounded-lg bg-[#2B2D31] p-3 text-[0.8rem] shadow-lg shadow-black/30">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-[#949BA4]">Live now — 1</p>
                        <Member name="Cocoa Crumbs" status="Streaming Just Chatting" live />
                        <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-wide text-[#949BA4]">Members — 1,204</p>
                        <Member name="Oreo HQ" />
                    </div>
                </Card>

                <Card
                    delay={60}
                    className="md:col-span-2 lg:col-span-3"
                    wide
                    title="Dashboard or slash commands"
                    body="Add creators, pick channels and tweak every message from the web dashboard. Prefer staying in Discord? Everything is under /settings too."
                >
                    <div className="w-full max-w-md divide-y divide-cream-200/6 rounded-2xl border border-cream-200/8 bg-cocoa-850 shadow-lg shadow-black/30">
                        {[
                            { platform: "youtube" as const, name: "Oreo HQ" as CreatorName, channel: "#uploads", on: true },
                            { platform: "twitch" as const, name: "Cocoa Crumbs" as CreatorName, channel: "#go-live", on: true },
                            { platform: "kick" as const, name: "Midnight Milk" as CreatorName, channel: "#go-live", on: false }
                        ].map((row) => (
                            <div key={row.name} className="flex items-center gap-3 px-4 py-3">
                                <Logo name={row.name} className="size-8" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-cream-100">{row.name}</p>
                                    <p className="flex items-center gap-1 text-xs text-cream-100/40">
                                        <PlatformIcon platform={row.platform} className="size-3" /> {row.channel}
                                    </p>
                                </div>
                                <span className={cn("relative h-5 w-9 rounded-full", row.on ? "bg-cream-500" : "bg-cocoa-600")}>
                                    <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow", row.on ? "left-[1.15rem]" : "left-0.5")} />
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </section>
    );
}


function Card({ title, body, children, className, delay = 0, wide = false }: { title: string, body: string, children: React.ReactNode, className?: string, delay?: number, wide?: boolean }) {
    return (
        <Reveal delay={delay} className={className}>
            <article
                className={cn(
                    "flex h-full flex-col gap-6 rounded-3xl border border-cream-200/7 bg-cocoa-800/60 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_0_var(--color-cocoa-950),0_18px_30px_-18px_rgb(0_0_0/0.9)] sm:p-6",
                    wide && "lg:flex-row-reverse lg:items-center"
                )}
            >
                <div
                    className={cn(
                        "pointer-events-none grid min-h-52 select-none place-items-center rounded-2xl bg-cocoa-900/80 p-5 shadow-[inset_0_2px_8px_rgb(0_0_0/0.55),inset_0_0_0_1px_rgb(255_255_255/0.03)]",
                        wide && "lg:flex-1"
                    )}
                    aria-hidden="true"
                >
                    {children}
                </div>
                <div className={cn(wide && "lg:max-w-sm lg:pl-2")}>
                    <h3 className="font-display text-2xl tracking-[-0.01em] text-cream-100">{title}</h3>
                    <p className="mt-2 leading-relaxed text-cream-100/55">{body}</p>
                </div>
            </article>
        </Reveal>
    );
}


function MiniEmbed({ color, footer, button, ended = false }: { color: string, footer: string, button: string, ended?: boolean }) {
    return (
        <div className="w-full max-w-[14rem] text-left">
            <div className="rounded-[4px] border-l-4 bg-[#2B2D31] px-3 py-2.5 shadow-lg shadow-black/30" style={{ borderLeftColor: color }}>
                <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-[#F2F3F5]">
                    <Logo name="Cocoa Crumbs" className="size-4" />
                    Cocoa Crumbs
                </p>
                <p className="mt-1 text-[0.8rem] font-semibold leading-snug text-[#00A8FC]">Late-night build, come hang</p>
                {ended && (
                    <p className="mt-1.5 text-[0.7rem] text-[#DBDEE1]">
                        <span className="font-semibold text-[#F2F3F5]">Streamed for</span> 2h 14m
                    </p>
                )}
                <p className="mt-1.5 flex items-center gap-1 text-[0.65rem] text-[#DBDEE1]/70">
                    <PlatformIcon platform="twitch" className="size-3" /> Twitch • {footer}
                </p>
            </div>
            <span className="mt-1.5 inline-flex h-7 items-center gap-1 rounded-md bg-[#4E5058] px-3 text-[0.72rem] font-medium text-white">
                {button} <ExternalLink className="size-3 opacity-80" />
            </span>
        </div>
    );
}


function Message({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full max-w-[16rem] gap-2.5 rounded-lg bg-[#313338] p-3 text-left shadow-lg shadow-black/30">
            <Image src="/oreo.png" alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 text-[0.8rem] leading-snug text-[#DBDEE1]">
                <p className="mb-0.5 flex items-center gap-1.5">
                    <span className="font-semibold text-cream-300">Oreo</span>
                    <span className="rounded-[3px] bg-blurple px-1 text-[0.55rem] font-semibold leading-[1.1rem] text-white">APP</span>
                </p>
                {children}
            </div>
        </div>
    );
}


function Mention({ children }: { children: React.ReactNode }) {
    return <span className="rounded-[3px] bg-blurple/30 px-0.5 font-medium text-[#C9CDFB]">{children}</span>;
}


function Token({ children }: { children: React.ReactNode }) {
    return <span className="rounded bg-cream-500/12 px-1 text-cream-400">{children}</span>;
}


function VoiceChannel({ platform, children }: { platform: "youtube" | "twitch" | "kick", children: React.ReactNode }) {
    return (
        <p className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[#949BA4]">
            <Volume2 className="size-4 shrink-0" />
            <PlatformIcon platform={platform} className="size-3.5 shrink-0" />
            <span className="truncate">{children}</span>
        </p>
    );
}


function Member({ name, status, live = false }: { name: CreatorName, status?: string, live?: boolean }) {
    return (
        <div className={cn("mt-2 flex items-center gap-2", !live && "opacity-55")}>
            <Logo name={name} className="size-8" />
            <div className="min-w-0">
                <p className={cn("truncate font-medium", live ? "text-[#F23F43]" : "text-[#DBDEE1]")}>{name}</p>
                {status && <p className="truncate text-[0.65rem] text-[#B5A6FF]">{status}</p>}
            </div>
            {live && <span className="ml-auto size-2 shrink-0 rounded-full bg-[#F23F43]" />}
        </div>
    );
}


function Logo({ name, className }: { name: CreatorName, className: string }) {
    const { icon: Icon, color } = CREATORS[name];
    return (
        <span className={cn("grid shrink-0 place-items-center rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]", color, className)}>
            <Icon className="size-[55%]" strokeWidth={2.25} />
        </span>
    );
}

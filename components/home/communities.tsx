import { Reveal } from "@/components/ui/reveal";
import { Avatar } from "@/components/ui/avatar";
import cn from "@/lib/cn";


export interface GuildInfo {
    name: string;
    icon: string;
    partnered: boolean;
    verified: boolean;
}

interface Props {
    guilds?: GuildInfo[];
    guildCount?: string;
    memberCount?: string;
}

export function Communities({ guilds, guildCount, memberCount }: Props) {
    if (!guilds?.length) return null;
    const filled = Array.from({ length: Math.max(guilds.length, 20) }, (_, index) => guilds[index % guilds.length]!);
    const rowA = filled.slice(0, 10);
    const rowB = filled.slice(10, 20);

    return (
        <section className="relative overflow-hidden border-b border-cocoa-700/60 bg-cocoa-950 py-14">
            <Reveal className="mx-auto mb-8 w-full max-w-6xl px-5 text-center sm:px-8">
                <p className="font-display text-2xl text-cream-100 sm:text-3xl">
                    Trusted by <span className="text-cream-400">{guildCount}</span> communities
                </p>
                <p className="mt-1.5 text-cream-100/45">
                    Reaching <span className="font-semibold text-cream-400">{memberCount}</span> members and counting
                </p>
            </Reveal>

            <div className="flex flex-col gap-4 pause-on-hover">
                <MarqueeRow guilds={rowA} />
                <MarqueeRow guilds={rowB} reverse />
            </div>
        </section>
    );
}


function MarqueeRow({ guilds, reverse = false }: { guilds: GuildInfo[], reverse?: boolean }) {
    return (
        <div className="mask-fade-x flex w-full flex-nowrap overflow-hidden">
            {[0, 1].map((copy) => (
                <ul
                    key={copy}
                    aria-hidden={copy === 1}
                    className={cn(
                        "flex shrink-0 items-center gap-4 pr-4",
                        reverse ? "animate-marquee-reverse" : "animate-marquee"
                    )}
                >
                    {guilds.map((guild, index) => (
                        <GuildChip key={`${guild.name}-${index}`} guild={guild} />
                    ))}
                </ul>
            ))}
        </div>
    );
}


function GuildChip({ guild }: { guild: GuildInfo }) {
    return (
        <li className="flex w-max shrink-0 items-center gap-3 rounded-2xl border border-cream-200/7 bg-cocoa-850/80 p-2 pr-4 transition-colors duration-300 hover:border-cream-300/20">
            {/* Eager, because lazy loading leaves blank tiles in the marquee */}
            <Avatar src={guild.icon} name={guild.name} shape="rounded" eager className="size-11 rounded-xl bg-cocoa-700 text-sm text-cream-100/80" />
            <div className="flex items-center gap-1.5">
                {(guild.partnered || guild.verified) && (
                    <BadgeIcon partnered={guild.partnered} />
                )}
                <span className="whitespace-nowrap font-medium text-cream-100">{guild.name}</span>
            </div>
        </li>
    );
}


function BadgeIcon({ partnered }: { partnered: boolean }) {
    return (
        <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
            <path
                d="M8 0.6 10 2.4 12.7 2.2 13.4 4.8 15.6 6.3 14.6 8.8 15.6 11.3 13.4 12.8 12.7 15.4 10 15.2 8 17 6 15.2 3.3 15.4 2.6 12.8 0.4 11.3 1.4 8.8 0.4 6.3 2.6 4.8 3.3 2.2 6 2.4Z"
                fill={partnered ? "#5865F2" : "var(--color-cream-500)"}
                transform="scale(0.94) translate(0.5 -0.4)"
            />
            <path d="M6.6 10.4 4.6 8.4l1-1 1 1 2.8-2.8 1 1Z" fill="var(--color-cocoa-850)" />
        </svg>
    );
}

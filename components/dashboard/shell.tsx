"use client";

import { useParams, usePathname } from "next/navigation";
import { LayoutGroup, m } from "motion/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Activity,
    BookOpen,
    Check,
    ChevronDown,
    ChevronsUpDown,
    Crown,
    ExternalLink,
    Gauge,
    LayoutGrid,
    LoaderCircle,
    LogOut,
    Menu as MenuIcon,
    Plus,
    Server,
    Users
} from "@/components/ui/glyphs";
import type { DashboardGuild, GuildLive, GuildOverview, PremiumSummary, SessionUser } from "@/lib/api/types";
import { Menu, MenuItem, MenuLabel, MenuLink, MenuSeparator } from "@/components/ui/menu";
import { IncidentBanner, StatusPill } from "@/components/dashboard/system-status";
import { api, isApiError, paths, resetLoginAttempts } from "@/lib/api/client";
import { CreatorAvatar, GuildIcon } from "@/components/dashboard/avatars";
import { PLATFORM_ORDER, platformName } from "@/lib/dashboard/platforms";
import { ToastProvider, useToast } from "@/components/dashboard/toast";
import { clearCache, revalidate, useApi } from "@/lib/api/hooks";
import { MotionProvider } from "@/components/motion/provider";
import { guildInviteUrl, loginUrl } from "@/lib/urls";
import { DiscordIcon } from "@/components/ui/icons";
import { CookieMark } from "@/components/ui/cookie";
import { planLabel, premiumEnabled, premiumOnSale } from "@/lib/premium";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/motion";
import cn from "@/lib/cn";


export const TOPBAR_OFFSET = 80;


export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <MotionProvider>
            <ToastProvider>
                <Frame>{children}</Frame>
            </ToastProvider>
        </MotionProvider>
    );
}


/** Server ids are Discord snowflakes, so anything else in the URL never reaches an API path */
const SNOWFLAKE = /^\d{17,20}$/;

function SessionExpiredNotice() {
    const toast = useToast();
    useEffect(() => {
        const onExpired = () => {
            const here = `${window.location.pathname}${window.location.search}`;
            toast.info("Your session has ended", {
                id: -1,
                duration: 0,
                description: "Log in again to keep managing your servers. Unsaved changes on this page stay here.",
                action: { label: "Log in again", href: loginUrl(here.startsWith("/dashboard") ? here : "/dashboard") }
            });
        };
        window.addEventListener("oreo:session-expired", onExpired);
        return () => window.removeEventListener("oreo:session-expired", onExpired);
    }, [toast]);
    return null;
}

function Frame({ children }: { children: React.ReactNode }) {
    const params = useParams<{ guildId?: string }>();
    const guildId = params.guildId && SNOWFLAKE.test(params.guildId) ? params.guildId : undefined;
    const pathname = usePathname();
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => setNavOpen(false), [pathname]);

    return (
        <div data-app="dashboard" className="relative min-h-svh bg-ink-950 bg-no-repeat text-paper [background-image:var(--page-glow)]">
            <a
                href="#main"
                className="sr-only z-[150] rounded-lg bg-cream-500 px-4 py-2 font-semibold text-[var(--color-cream-900)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
            >
                Skip to content
            </a>

            <SessionExpiredNotice />
            <TopBar guildId={guildId} onOpenNav={() => setNavOpen(true)} />

            <div className="relative flex w-full">
                {guildId && (
                    <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-[16.5rem] shrink-0 overflow-y-auto border-r border-cream-200/[0.06] lg:block">
                        <LayoutGroup id="sidebar">
                            <GuildNav guildId={guildId} />
                        </LayoutGroup>
                    </aside>
                )}
                <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                    <IncidentBanner />
                    {children}
                </main>
            </div>

            {guildId && (
                <Drawer open={navOpen} onClose={() => setNavOpen(false)} label="Server navigation" className="lg:hidden">
                    <LayoutGroup id="drawer">
                        <GuildNav guildId={guildId} />
                    </LayoutGroup>
                </Drawer>
            )}
        </div>
    );
}


const TOP_LINKS = [
    { href: "/guide", label: "Guide", external: true },
    { href: "/support", label: "Support", external: true }
];

function TopBar({ guildId, onOpenNav }: { guildId?: string, onOpenNav: () => void }) {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 h-16 border-b border-cream-200/[0.06] bg-cocoa-850/80 backdrop-blur-md">
            <div className="flex h-full w-full items-center gap-1 px-5 lg:px-[8.25rem]">
                {guildId && (
                    <button
                        type="button"
                        onClick={onOpenNav}
                        aria-label="Open server navigation"
                        className="mr-1 grid size-9 shrink-0 place-items-center rounded-[0.625rem] border border-paper/10 bg-ink-850 text-paper/80 transition-colors hover:bg-ink-800 lg:hidden"
                    >
                        <MenuIcon className="size-[1.125rem]" />
                    </button>
                )}

                <Link href="/" prefetch={false} className="group mr-4 flex shrink-0 items-center gap-2 rounded-lg" aria-label="Oreo home">
                    <CookieMark className="size-8 transition-transform duration-500 ease-out-quint group-hover:rotate-[24deg]" />
                    <span className="font-display text-2xl leading-none tracking-wide text-cream-500">OREO</span>
                </Link>

                <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
                    <TopLink href="/dashboard" active={pathname === "/dashboard"}>Servers</TopLink>
                    <TopLink href="/dashboard/status" active={pathname === "/dashboard/status"}>Status</TopLink>
                    {TOP_LINKS.map((link) => (
                        <TopLink key={link.href} href={link.href} external={link.external}>
                            {link.label}
                        </TopLink>
                    ))}
                    {premiumEnabled && (
                        <Link
                            href="/dashboard/premium"
                            prefetch={false}
                            aria-current={pathname === "/dashboard/premium" ? "page" : undefined}
                            className={cn(
                                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[0.95rem] font-medium transition-colors hover:bg-cream-500/[0.08]",
                                pathname === "/dashboard/premium" ? "text-cream-300" : "text-cream-400 hover:text-cream-300"
                        )}
                    >
                        Premium
                        <Crown className="size-3.5" />
                    </Link>
                    )}
                </nav>

                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <StatusPill />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

function TopLink({ href, active, external, children }: { href: string, active?: boolean, external?: boolean, children: React.ReactNode }) {
    return (
        <Link
            href={href}
            prefetch={false}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
                "rounded-xl px-3 py-2 text-[0.95rem] font-medium transition-colors duration-150 hover:bg-cream-100/6 hover:text-cream-100",
                active ? "bg-cream-100/6 text-cream-100" : "text-cream-100/60"
            )}
        >
            {children}
        </Link>
    );
}


function UserMenu() {
    const me = useApi<SessionUser>(paths.me);
    const toast = useToast();
    const user = me.data;
    useEffect(() => {
        if (user) resetLoginAttempts();
    }, [user]);
    const name = user?.globalName ?? user?.username ?? "";

    const logout = async () => {
        try {
            await api.post(paths.logout, undefined, { noLoginRedirect: true });
        } catch (error) {
            if (!(isApiError(error) && error.status === 401)) {
                toast.error(error, { title: "Couldn't log you out" });
                return;
            }
        }
        clearCache();
        window.location.assign("/");
    };

    if (!user) {
        return me.loading ? (
            <Skeleton className="h-9 w-32 rounded-[0.625rem]" />
        ) : (
            <span className="grid size-9 place-items-center rounded-full bg-ink-700 text-sm text-paper/75" aria-label="Account unavailable">
                ?
            </span>
        );
    }

    return (
        <Menu
            label="Account"
            align="end"
            width={248}
            trigger={(props, open) => (
                <button
                    {...props}
                    type="button"
                    aria-label={`Account: ${name}`}
                    className={cn(
                        "flex h-9 items-center gap-2 rounded-[0.625rem] border border-paper/10 bg-ink-850 pl-1 pr-1.5 transition-colors duration-150 hover:border-paper/16 hover:bg-ink-800 sm:pr-2.5",
                        open && "border-paper/16 bg-ink-800"
                    )}
                >
                    <Avatar src={user.avatarUrl} name={name} className="size-7 text-[0.625rem]" />
                    <span className="hidden max-w-32 truncate text-sm font-medium text-paper sm:block">{name}</span>
                    <ChevronDown
                        className={cn("hidden size-3.5 text-paper/60 transition-transform duration-200 sm:block", open && "rotate-180")}
                        aria-hidden="true"
                    />
                </button>
            )}
        >
            <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-2" role="presentation">
                <Avatar src={user.avatarUrl} name={name} className="size-9 text-xs" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-paper">{name}</p>
                    <p className="truncate text-xs text-paper/60">@{user.username}</p>
                </div>
            </div>
            <MenuSeparator />
            <MenuLink href="/dashboard" icon={<Server />}>Your servers</MenuLink>
            {premiumEnabled && <MenuLink href="/dashboard/premium" icon={<Crown />}>Premium</MenuLink>}
            <MenuLink href="/dashboard/status" icon={<Activity />}>Oreo status</MenuLink>
            <MenuLink href="/guide" external icon={<BookOpen />}>Guide</MenuLink>
            <MenuLink href="/support" external icon={<DiscordIcon />}>Support server</MenuLink>
            <MenuSeparator />
            <MenuItem tone="danger" icon={<LogOut />} onSelect={logout}>
                Log out
            </MenuItem>
        </Menu>
    );
}


function GuildNav({ guildId }: { guildId: string }) {
    const pathname = usePathname();
    const overview = useApi<GuildOverview>(paths.guild(guildId));
    const base = `/dashboard/${guildId}`;
    const unavailable = !overview.data && Boolean(overview.error);

    const items = [
        { href: base, label: "Overview", icon: <LayoutGrid />, active: pathname === base },
        {
            href: `${base}/creators`,
            label: "Creators",
            icon: <Users />,
            count: overview.data?.creators.length,
            active: pathname.startsWith(`${base}/creators`)
        },
        {
            href: `${base}/counters`,
            label: "Counters",
            icon: <Gauge />,
            count: overview.data?.counters.length,
            active: pathname.startsWith(`${base}/counters`)
        },
        ...(premiumOnSale(overview.data?.limits) || overview.data?.limits.premium
            ? [{ href: `${base}/profile`, label: "Bot profile", icon: <Crown />, active: pathname.startsWith(`${base}/profile`) }]
            : [])
    ];

    return (
        <div className="flex min-h-full flex-col px-3 pb-4 pt-4">
            <GuildSwitcher guildId={guildId} overview={overview.data} unavailable={unavailable} />

            {!unavailable && (
                <>
                    <nav aria-label="Server" className="mt-5 flex flex-col gap-0.5">
                        {items.map((item) => (
                            <NavItem key={item.href} {...item} />
                        ))}
                    </nav>
                    <LiveNow guildId={guildId} overview={overview.data} />
                </>
            )}

            <div className="mt-auto space-y-3 pt-6">
                {overview.data && <PlanCard guildId={guildId} overview={overview.data} />}
                <div className="flex flex-col gap-0.5">
                    <NavItem href="/guide" label="Guide" icon={<BookOpen />} external />
                    <NavItem href="/support" label="Support" icon={<DiscordIcon />} external />
                </div>
            </div>
        </div>
    );
}


function NavItem({
    href,
    label,
    icon,
    count,
    active,
    external
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
    count?: number;
    active?: boolean;
    external?: boolean;
}) {
    return (
        <Link
            href={href}
            prefetch={external ? false : undefined}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
                "group relative flex h-10 items-center gap-3 rounded-[0.625rem] px-3 text-sm font-medium transition-colors duration-150",
                active ? "text-paper" : "text-paper/70 hover:bg-paper/[0.04] hover:text-paper"
            )}
        >
            {active && (
                <m.span
                    layoutId="nav-active"
                    transition={spring.snappy}
                    className="absolute inset-0 rounded-[0.625rem] border border-paper/[0.07] bg-ink-750 raised-depth"
                    aria-hidden="true"
                >
                    <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-cream-500" />
                </m.span>
            )}
            <span className={cn("relative [&_svg]:size-4", active ? "text-cream-400" : "text-paper/55 group-hover:text-paper/70")}>{icon}</span>
            <span className="relative flex-1">{label}</span>
            {count !== undefined && <span className={cn("relative min-w-5 rounded-md px-1.5 py-px text-center text-xs tabular-nums", active ? "bg-cream-500/15 text-cream-300" : "bg-paper/[0.05] text-paper/60")}>{count}</span>}
            {external && <ExternalLink className="relative size-3.5 text-paper/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />}
        </Link>
    );
}


function GuildSwitcher({ guildId, overview, unavailable }: { guildId: string, overview: GuildOverview | undefined, unavailable: boolean }) {
    const guilds = useApi<DashboardGuild[]>(paths.guilds);
    const current = guilds.data?.find((guild) => guild.id === guildId);
    const withBot = guilds.data?.filter((guild) => guild.botPresent) ?? [];
    const withoutBot = guilds.data?.filter((guild) => !guild.botPresent) ?? [];

    const plan = overview ? planLabel(overview.limits) : unavailable ? "Unavailable" : null;

    return (
        <Menu
            label="Switch server"
            width={256}
            trigger={(props, open) => (
                <button
                    {...props}
                    type="button"
                    className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl border border-paper/8 bg-ink-850 p-2 pr-2.5 text-left transition-colors duration-150 hover:border-paper/14 hover:bg-ink-800",
                        open && "border-paper/14 bg-ink-800"
                    )}
                >
                    {current ? (
                        <GuildIcon name={current.name} iconUrl={current.iconUrl} className="size-9 text-xs" />
                    ) : (
                        <Skeleton className="size-9 rounded-[26%]" />
                    )}
                    <span className="min-w-0 flex-1">
                        {current ? (
                            <span className="block truncate text-sm font-semibold text-paper" title={current.name}>{current.name}</span>
                        ) : (
                            <Skeleton className="h-3.5 w-24" />
                        )}
                        {plan ? (
                            <span className={cn("mt-0.5 flex items-center gap-1 text-xs", overview?.limits.premium ? "text-cream-400" : "text-paper/55")}>
                                {overview?.limits.premium && <Crown className="size-3" />}
                                {plan}
                            </span>
                        ) : overview ? null : (
                            <Skeleton className="mt-1 h-2.5 w-14" />
                        )}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-paper/50" aria-hidden="true" />
                </button>
            )}
        >
            {withBot.length > 0 && <MenuLabel>Your servers</MenuLabel>}
            {withBot.map((guild) => (
                <MenuLink
                    key={guild.id}
                    href={`/dashboard/${guild.id}`}
                    active={guild.id === guildId}
                    icon={<GuildIcon name={guild.name} iconUrl={guild.iconUrl} className="!size-6 text-[0.5625rem]" />}
                >
                    <span className="min-w-0 flex-1 truncate">{guild.name}</span>
                    {guild.id === guildId && <Check className="shrink-0 text-cream-400" aria-hidden="true" />}
                </MenuLink>
            ))}

            {withoutBot.length > 0 && (
                <>
                    <MenuSeparator />
                    <MenuLabel>Add Oreo</MenuLabel>
                    {withoutBot.slice(0, 5).map((guild) => (
                        <MenuLink
                            key={guild.id}
                            href={guildInviteUrl(guild.id)}
                            external
                            icon={<GuildIcon name={guild.name} iconUrl={guild.iconUrl} className="!size-6 text-[0.5625rem]" />}
                        >
                            <span className="min-w-0 flex-1 truncate text-paper/70">{guild.name}</span>
                            <Plus className="shrink-0 text-paper/50" aria-hidden="true" />
                        </MenuLink>
                    ))}
                </>
            )}

            <MenuSeparator />
            <MenuLink href="/dashboard" icon={<Server />}>All servers</MenuLink>
        </Menu>
    );
}


function LiveNow({ guildId, overview }: { guildId: string, overview: GuildOverview | undefined }) {
    const live = useApi<GuildLive>(overview ? paths.live(guildId) : null);
    const entries = (live.data ?? [])
        .map((entry) => ({ entry, item: overview?.creators.find((creator) => creator.id === entry.guildCreatorId) }))
        .filter((row): row is { entry: GuildLive[number], item: NonNullable<typeof row.item> } => Boolean(row.item))
        .slice(0, 6);

    if (!entries.length) return null;

    return (
        <div className="mt-6">
            <p className="flex items-center gap-2 px-2.5 text-xs font-medium text-paper/55">
                <span className="live-dot size-1.5 text-[#FF3B55]" aria-hidden="true" />
                Live now
            </p>
            <ul className="mt-1.5 flex flex-col gap-0.5">
                {entries.map(({ entry, item }) => (
                    <li key={entry.guildCreatorId}>
                        <Link
                            href={`/dashboard/${guildId}/creators/${item.id}`}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-paper/[0.04]"
                            title={entry.content?.title ?? undefined}
                        >
                            <CreatorAvatar creator={item.creator} className="size-6 text-[0.5rem]" badgeClassName="size-3 ring-1 [&_svg]:size-2" />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-paper/85">{item.creator.displayName}</span>
                                {entry.content?.category && <span className="block truncate text-xs text-paper/55">{entry.content.category}</span>}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}


function PlanCard({ guildId, overview }: { guildId: string, overview: GuildOverview }) {
    const { limits } = overview;
    const me = useApi<SessionUser>(paths.me);
    const premium = useApi<PremiumSummary>(premiumEnabled ? paths.premium : null);
    const toast = useToast();
    const [giving, setGiving] = useState(false);
    const used = PLATFORM_ORDER.reduce((sum, platform) => sum + limits.slots[platform].used, 0);
    const total = PLATFORM_ORDER.reduce((sum, platform) => sum + limits.slots[platform].total, 0);
    const full = PLATFORM_ORDER.filter((platform) => limits.slots[platform].used >= limits.slots[platform].total);
    const mine = premium.data?.assignments.find((assignment) => assignment.guildId === guildId);
    const free = premium.data ? premium.data.servers.total - premium.data.servers.used : 0;

    const give = async () => {
        setGiving(true);
        try {
            premium.mutate(await api.put<PremiumSummary>(paths.guildPremium(guildId)));
            await revalidate(paths.guild(guildId));
            toast.success("This server has premium", { description: "Its limits went up right away." });
        } catch (error) {
            toast.error(error, { title: "Couldn't give premium" });
        } finally {
            setGiving(false);
        }
    };

    return (
        <div className="panel rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs">
                <span className={cn("flex items-center gap-1.5 font-semibold", limits.premium ? "text-cream-400" : "text-paper/85")}>
                    <Crown className={cn("size-3.5", limits.premium ? "text-cream-400" : "text-paper/55")} />
                    {planLabel(limits) ?? "Slots used"}
                </span>
                <span className="tabular-nums text-paper/55">{used}/{total} creators</span>
            </div>
            <div className="mt-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-paper/[0.07]" aria-hidden="true">
                <m.span
                    className="accent-fill h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${total ? Math.max((used / total) * 100, used ? 4 : 0) : 0}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
            {limits.premium && (
                <p className="mt-2 text-xs leading-relaxed text-paper/60">
                    {mine ? "From your premium" : "Premium"}
                    {limits.premiumUntil ? ` until ${new Date(limits.premiumUntil).toLocaleDateString(undefined, { dateStyle: "medium" })}` : ", no end date"}
                    {mine && premiumEnabled && (
                        <>
                            {" · "}
                            <Link href="/dashboard/premium" className="font-medium text-cream-400 hover:text-cream-300">Manage</Link>
                        </>
                    )}
                </p>
            )}
            {!limits.premium && premiumOnSale(limits) && (
                <>
                    <p className="mt-2 text-xs leading-relaxed text-paper/60">
                        {full.length ? `${full.map(platformName).join(" & ")} ${full.length === 1 ? "is" : "are"} full. ` : ""}
                        Premium gives 25 creators per platform.
                    </p>
                    {me.data && free > 0 ? (
                        <Button variant="primary" size="xs" className="mt-2.5 w-full" onClick={give} disabled={giving}>
                            {giving ? <LoaderCircle className="animate-spin" /> : <Crown />}
                            Give premium ({free} left)
                        </Button>
                    ) : (
                        <Button variant="secondary" size="xs" className="mt-2.5 w-full" href="/dashboard/premium">
                            <Crown />
                            Get premium
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}

"use client";

import { CircleAlert, Info, LogIn, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loginUrl } from "@/lib/urls";
import cn from "@/lib/cn";


type Outcome = "cancelled" | "failed" | "unavailable";

const copy: Record<Outcome, { title: string, body: string, retry: boolean }> = {
    cancelled: {
        title: "Login cancelled",
        body: "No worries, nothing changed. Log in with Discord whenever you're ready to manage your servers.",
        retry: true
    },
    failed: {
        title: "We couldn't log you in",
        body: "Discord didn't let us finish logging you in. It's usually a one-off, so give it another go.",
        retry: true
    },
    unavailable: {
        title: "The dashboard is taking a break",
        body: "Logins aren't available right now. You can still set everything up with /settings in Discord.",
        retry: false
    }
};


export function LoginNotice() {
    const params = useSearchParams();
    const login = params.get("login");
    const [outcome, setOutcome] = useState<Outcome | null>(null);

    useEffect(() => {
        if (login !== "cancelled" && login !== "failed" && login !== "unavailable") return;
        setOutcome(login);
        const url = new URL(window.location.href);
        url.searchParams.delete("login");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }, [login]);

    useEffect(() => {
        if (!outcome) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOutcome(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [outcome]);

    if (!outcome) return null;
    const text = copy[outcome];
    const soft = outcome === "cancelled";

    return (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-3 sm:top-24">
            <div
                role={soft ? "status" : "alert"}
                className="animate-rise pointer-events-auto flex w-full max-w-md items-start gap-3.5 rounded-3xl border border-cream-200/12 bg-cocoa-850/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
                <span
                    className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-2xl",
                        soft ? "bg-cream-500/12 text-cream-400" : "bg-red-500/12 text-red-300"
                    )}
                >
                    {soft ? <Info className="size-5" /> : <CircleAlert className="size-5" />}
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                    <p className="font-semibold text-cream-100">{text.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-cream-100/60">{text.body}</p>
                    {text.retry && (
                        <a
                            href={loginUrl("/dashboard")}
                            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl bg-cream-500 px-3.5 text-sm font-semibold text-cocoa-950 transition-colors hover:bg-cream-400"
                        >
                            <LogIn className="size-4" />
                            {outcome === "failed" ? "Try again" : "Log in with Discord"}
                        </a>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setOutcome(null)}
                    aria-label="Dismiss"
                    className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-xl text-cream-100/45 transition-colors hover:bg-cream-100/8 hover:text-cream-100"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}

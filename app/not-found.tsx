import { SiteChrome } from "@/components/site/chrome";
import { OreoFactory } from "@/components/ui/factory";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page not found"
};


export default function NotFound() {
    return (
        <SiteChrome>
            <section className="relative grid min-h-[86svh] place-items-center overflow-hidden px-5 py-28">
                <div
                    className="pointer-events-none absolute left-1/2 top-1/3 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[130px]"
                    style={{ background: "radial-gradient(circle, var(--color-cream-500) 0%, transparent 70%)" }}
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.045) 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                        maskImage: "radial-gradient(ellipse 70% 55% at 50% 45%, black 10%, transparent 75%)"
                    }}
                    aria-hidden="true"
                />

                <div className="relative w-full max-w-3xl text-center">
                    <OreoFactory className="mx-auto max-w-2xl" />

                    <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cream-500">Error 404</p>
                    <h1 className="mt-3 font-display text-4xl tracking-tight text-cream-100 sm:text-5xl">
                        This page didn&apos;t make the batch
                    </h1>
                    <p className="mx-auto mt-3.5 max-w-md text-lg text-cream-100/55">
                        The line&apos;s running and the cookies are fine, but the page you asked for never came off
                        it. The link may be stale, or the page has moved.
                    </p>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button href="/" size="lg" className="w-full sm:w-auto">
                            <ArrowLeft className="size-5" />
                            Back to safety
                        </Button>
                        <Button href="/guide" variant="cocoa" size="lg" className="w-full sm:w-auto">
                            <BookOpen className="size-5" />
                            Read the guide
                        </Button>
                    </div>
                </div>
            </section>
        </SiteChrome>
    );
}

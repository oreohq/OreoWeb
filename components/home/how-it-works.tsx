import { BellRing, Radio, UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/ui/reveal";
import Link from "next/link";


const STEPS = [
    {
        icon: UserPlus,
        title: "Add a creator",
        body: "Paste a YouTube, Twitch or Kick link in the dashboard or with /settings, then pick where to post and who to ping."
    },
    {
        icon: Radio,
        title: "Oreo catches it",
        body: "It listens to each platform's own events, so it knows the moment a stream starts or a video goes up. No polling every few minutes."
    },
    {
        icon: BellRing,
        title: "Your server gets pinged",
        body: "Your message and embed, filled in with the title, category and thumbnail. When the stream ends, the post updates itself."
    }
];


export function HowItWorks() {
    return (
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-28 sm:px-8">
            <SectionHeading
                eyebrow="How it works"
                title="From go-live to ping in seconds"
                description="No webhooks to paste and nothing to host. Pick a creator, Oreo does the rest."
            />

            <ol className="mt-14 grid gap-5 lg:grid-cols-3">
                {STEPS.map((step, index) => (
                    <Reveal as="li" key={step.title} delay={index * 90}>
                        <article className="flex h-full flex-col rounded-3xl border border-cream-200/7 bg-cocoa-800/60 p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_0_var(--color-cocoa-950),0_18px_30px_-18px_rgb(0_0_0/0.9)] sm:p-7">
                            <div className="flex items-center justify-between">
                                <span className="grid size-11 place-items-center rounded-xl bg-cocoa-900/80 text-cream-400 shadow-[inset_0_2px_6px_rgb(0_0_0/0.55),inset_0_0_0_1px_rgb(255_255_255/0.03)]">
                                    <step.icon className="size-5" />
                                </span>
                                <span className="select-none font-display text-4xl text-cream-100/10" aria-hidden="true">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <h3 className="mt-6 font-display text-2xl tracking-[-0.01em] text-cream-100">{step.title}</h3>
                            <p className="mt-2 leading-relaxed text-cream-100/55">{step.body}</p>
                        </article>
                    </Reveal>
                ))}
            </ol>

            <Reveal className="mt-10 text-center text-cream-100/50">
                Takes about a minute:{" "}
                <Link href="/invite" prefetch={false} target="_blank" rel="noreferrer" className="font-medium text-cream-400 underline decoration-cream-500/40 underline-offset-2 hover:text-cream-300">
                    invite Oreo
                </Link>
                , then open the{" "}
                <Link href="/dashboard" prefetch={false} className="font-medium text-cream-400 underline decoration-cream-500/40 underline-offset-2 hover:text-cream-300">
                    dashboard
                </Link>
                .
            </Reveal>
        </section>
    );
}

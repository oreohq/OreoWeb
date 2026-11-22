"use client";

import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { premiumEnabled } from "@/lib/premium";
import { Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import cn from "@/lib/cn";


const faqs = [
    {
        question: "How do I add Oreo to my server?",
        answer: (
            <>
                You need the <Mono>Manage Server</Mono> permission on the server you want Oreo in. Open{" "}
                <Anchor href="/invite">oreo.aniket.zip/invite</Anchor>, pick your server, leave every permission
                checked, and hit Authorize. Then run <Mono>/settings</Mono> to configure it.
            </>
        )
    },
    {
        question: "Which platforms does Oreo support?",
        answer: (
            <>
                <strong className="text-cream-100">YouTube:</strong> videos, premieres, shorts, livestreams and members-only posts.{" "}
                <strong className="text-cream-100">Twitch</strong> and <strong className="text-cream-100">Kick:</strong> livestreams, with a link to the recording when they end. Every type can be
                switched on or off per creator.
            </>
        )
    },
    {
        question: "How fast are the notifications?",
        answer: (
            <>
                Oreo listens to platform webhooks and event subscriptions rather than polling on a timer, so
                a go-live typically reaches your server in a couple of seconds. If a platform is slow to fire
                its own event, Oreo falls back to a direct check so the post still goes out.
            </>
        )
    },
    {
        question: "Can I customize the message and who gets pinged?",
        answer: (
            <>
                Yes, per creator. Set the channel, rewrite the message with placeholders, restyle or remove
                the embed, and choose a role to mention so only people who opted in get notified. It is all
                under <Mono>/settings</Mono>, and the{" "}
                <Anchor href="/guide" external={false}>guide</Anchor> walks through each option.
            </>
        )
    },
    {
        question: "Can I limit commands to certain channels or roles?",
        answer: (
            <>
                That is a Discord feature: Server Settings → Integrations → Oreo → Manage. From there you can
                restrict any command to specific roles or channels.
            </>
        )
    },
    {
        question: "Is Oreo free?",
        answer: (
            <>
                Yes. Every server gets one creator per platform and two counters for free, with every feature.
                {premiumEnabled ? (
                    <>
                        Premium raises that to 25 creators per platform and 10 counters. Ask in the{" "}
                        <Anchor href="/support">support server</Anchor>.{" "}
                    </>
                ) : null}
                You can also{" "}
                <Anchor href="/vote">vote on Top.gg</Anchor> or <Anchor href="/kofi">buy a coffee</Anchor> to help out.
            </>
        )
    }
];


export function Faq() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-28 sm:px-8">
            <SectionHeading
                eyebrow="FAQ"
                title="Questions, answered"
                description="The things people ask before adding Oreo."
            />

            <ul className="mx-auto mt-14 max-w-3xl space-y-4">
                {faqs.map((faq, index) => {
                    const isOpen = open === index;
                    return (
                        <Reveal as="li" key={faq.question} delay={index * 50}>
                            <div
                                className={cn(
                                    "rounded-3xl border transition-colors duration-300",
                                    "shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_0_var(--color-cocoa-950),0_18px_30px_-18px_rgb(0_0_0/0.9)]",
                                    isOpen ? "border-cream-300/20 bg-cocoa-800/70" : "border-cream-200/7 bg-cocoa-850/60 hover:border-cream-200/16"
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                                >
                                    <span className="flex-1 text-lg font-medium text-cream-100">{faq.question}</span>
                                    <span
                                        className={cn(
                                            "grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-300",
                                            isOpen ? "bg-cream-500/20 text-cream-300" : "bg-cream-500/10 text-cream-400"
                                        )}
                                    >
                                        <Plus className={cn("size-4 transition-transform duration-300", isOpen && "rotate-45")} />
                                    </span>
                                </button>
                                <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                                    <div className="overflow-hidden">
                                        <p className="mx-5 border-t border-cream-200/7 pb-6 pt-4 leading-relaxed text-cream-100/60 sm:mx-6 sm:pr-10">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    );
                })}
            </ul>

            <Reveal className="mt-10 text-center text-cream-100/50">
                Still stuck? Real people answer in the <Anchor href="/support">support server</Anchor>.
            </Reveal>
        </section>
    );
}

function Mono({ children }: { children: React.ReactNode }) {
    return (
        <code className="rounded bg-cream-500/12 px-1.5 py-0.5 font-mono text-[0.85em] text-cream-400">
            {children}
        </code>
    );
}


function Anchor({ href, children, external = true }: { href: string, children: React.ReactNode, external?: boolean }) {
    return (
        <Link
            href={href}
            prefetch={false}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="font-medium text-cream-400 underline decoration-cream-500/40 underline-offset-2 transition-colors hover:text-cream-300"
        >
            {children}
        </Link>
    );
}

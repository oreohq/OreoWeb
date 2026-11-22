import { AddIcon, DiscordIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";


export function Cta() {
    return (
        <section className="mx-auto w-full max-w-6xl px-5 pb-28 pt-8 sm:px-8">
            <Reveal>
                <div className="relative overflow-hidden rounded-[2rem] bg-cocoa-800 px-6 py-24 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-2px_0_rgb(0_0_0/0.35),0_8px_0_var(--color-cocoa-950),0_30px_50px_-20px_rgb(0_0_0/0.9)] sm:px-12 sm:py-32">
                    <Screw className="left-6 top-6 rotate-12" />
                    <Screw className="right-6 top-6 -rotate-[20deg]" />
                    <Screw className="bottom-6 left-6 rotate-[35deg]" />
                    <Screw className="bottom-6 right-6 rotate-[5deg]" />

                    <h2 className="font-display text-[2.1rem] leading-[1.06] tracking-[-0.02em] text-cream-100 [text-shadow:0_2px_0_rgb(0_0_0/0.45)] sm:text-5xl">
                        Ready when they go live
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-lg text-cream-100/55">
                        Free to start. Set up in about a minute.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
                        <Button href="/invite" external variant="key" size="lg" className="w-full sm:w-auto">
                            <AddIcon className="size-5" />
                            Add to Discord
                        </Button>
                        <Button href="/support" external variant="keyCocoa" size="lg" className="w-full sm:w-auto">
                            <DiscordIcon className="size-5" />
                            Join the support server
                        </Button>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}




function Screw({ className }: { className: string }) {
    return (
        <span
            className={`absolute grid size-6 place-items-center rounded-full bg-cocoa-950/70 shadow-[inset_0_2px_3px_rgb(0_0_0/0.7),0_1px_0_rgb(255_255_255/0.07)] ${className}`}
            aria-hidden="true"
        >
            <span className="relative grid size-[1.125rem] place-items-center rounded-full bg-cocoa-600 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_2px_3px_rgb(0_0_0/0.6)]">
                <span className="absolute h-[3px] w-2.5 rounded-[1px] bg-cocoa-900" />
                <span className="absolute h-2.5 w-[3px] rounded-[1px] bg-cocoa-900" />
            </span>
        </span>
    );
}

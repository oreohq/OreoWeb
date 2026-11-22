import { Reveal } from "@/components/ui/reveal";
import cn from "@/lib/cn";


interface Props {
    eyebrow?: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    align?: "center" | "left";
    className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: Props) {
    return (
        <Reveal className={cn(align === "center" && "text-center", className)}>
            {eyebrow && <p className="mb-2 font-display text-lg text-cream-100/35 sm:text-xl">{eyebrow}</p>}

            <h2 className="font-display text-[2.1rem] leading-[1.06] tracking-[-0.02em] text-cream-100 sm:text-5xl">
                {title}
            </h2>

            {description && (
                <p
                    className={cn(
                        "mt-4 text-lg leading-relaxed text-cream-100/55",
                        align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
                    )}
                >
                    {description}
                </p>
            )}
        </Reveal>
    );
}

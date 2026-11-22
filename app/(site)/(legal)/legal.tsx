import { Markdown } from "@/components/markdown/markdown";
import { getLegalContent } from "@/lib/content";
import { notFound } from "next/navigation";


export async function LegalPage({ name }: { name: "terms" | "privacy" }) {
    const content = await getLegalContent(name);
    if (!content) notFound();

    return (
        <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
            <article className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-400">Legal</p>
                <div className="seam mt-6 h-px w-full" />
                <div className="mt-6">
                    <Markdown content={content} />
                </div>
            </article>
        </div>
    );
}

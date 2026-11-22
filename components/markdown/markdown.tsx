import { Channel, Emoji, Mention, Timestamp } from "./discord";
import { ExternalLink, Info } from "lucide-react";
import { ImageModal } from "./image-modal";
import ReactMarkdown from "react-markdown";
import { getBaseUrl } from "@/lib/urls";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import cn from "@/lib/cn";


/** Embeds the guide may use, compared on the parsed URL so look-alike hosts don't pass */
const ALLOWED_IFRAMES = [
    { origin: "https://www.youtube.com", path: "/embed/" },
    { origin: "https://e.widgetbot.io", path: "/channels/" },
    { origin: new URL(getBaseUrl()).origin, path: "/" }
];

function allowedIframe(src: string) {
    try {
        const url = new URL(src);
        return ALLOWED_IFRAMES.some((allowed) => url.origin === allowed.origin && url.pathname.startsWith(allowed.path));
    } catch {
        return false;
    }
}

const slug = (node: React.ReactNode) =>
    String(node ?? "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");


export async function Markdown({ content }: { content: string }) {
    const { renderToString } = await import("react-dom/server");

    // Discord markup has no CommonMark equivalent, so it is pre-rendered to HTML for rehype-raw
    const prepared = content
        .replace(/__(.*?)__/g, "<u>$1</u>")
        .replace(/<a?:\w{2,32}:(\d{15,21})>/g, (_m, id) => renderToString(<Emoji id={id} />))
        .replace(/<@&?!?(\w+)>/g, (_m, name) => renderToString(<Mention name={String(name).replaceAll("_", " ")} />))
        .replace(/<#!?(\w+)>/g, (_m, name) => renderToString(<Channel name={String(name)} />))
        .replace(/<t:(\d{1,10}):([RfFdDtT])?>/g, (_m, unix, format) =>
            renderToString(<Timestamp unix={parseInt(unix)} format={format ?? "f"} />)
        );

    return (
        <div className="text-[1.02rem] leading-relaxed text-cream-100/65">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({ children }) => (
                        <Heading level={1} id={slug(children)}>{children}</Heading>
                    ),
                    h2: ({ children }) => (
                        <Heading level={2} id={slug(children)}>{children}</Heading>
                    ),
                    h3: ({ children }) => (
                        <Heading level={3} id={slug(children)}>{children}</Heading>
                    ),

                    p: ({ children }) => <p className="my-3">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-cream-100">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    del: ({ children }) => <del className="line-through opacity-70">{children}</del>,
                    hr: () => <hr className="my-8 border-cocoa-700" />,

                    blockquote: ({ children }) => (
                        <blockquote className="my-4 border-l-2 border-cream-500/50 pl-4 text-cream-100/55">
                            {children}
                        </blockquote>
                    ),

                    code: ({ className, children, ...props }) => {
                        const isBlock = Boolean(className?.includes("language-"));
                        if (isBlock) {
                            return (
                                <pre className="my-4 overflow-x-auto rounded-2xl border border-cream-200/8 bg-cocoa-900 p-4">
                                    <code className="font-mono text-sm text-cream-100/85" {...props}>{children}</code>
                                </pre>
                            );
                        }
                        return (
                            <code className="rounded bg-cream-500/12 px-1.5 py-0.5 font-mono text-[0.88em] text-cream-400">
                                {children}
                            </code>
                        );
                    },

                    img: ({ alt = "", src }) => {
                        const url = String(src ?? "");
                        const clean = url.split("?")[0] ?? "";
                        if (url.includes("fullwidth=true")) {
                            return (
                                <ImageModal
                                    src={clean}
                                    mobileSrc={clean.replace("guide-assets", "guide-mobile")}
                                    alt={alt}
                                />
                            );
                        }
                        return (
                            <span className="my-2 inline-block max-w-lg align-middle">
                                <img src={clean} alt={alt} loading="lazy" className="rounded-xl" />
                            </span>
                        );
                    },

                    a: ({ href, children }) => {
                        const raw = href ?? "#";
                        const internal = raw.includes("target=_self") || (raw.startsWith("/") && !raw.includes("target=_blank"));
                        const url = raw.startsWith("/") ? (raw.split("?")[0] ?? raw) : raw;
                        return (
                            <Link
                                href={url}
                                prefetch={false}
                                target={internal ? undefined : "_blank"}
                                rel={internal ? undefined : "noreferrer"}
                                className="font-medium text-cream-400 underline decoration-cream-500/40 underline-offset-2 transition-colors hover:text-cream-300"
                            >
                                {children}
                                {!internal && <ExternalLink className="mb-0.5 ml-0.5 inline size-3.5" />}
                            </Link>
                        );
                    },

                    ol: ({ children, start }) => (
                        <ol className="guide-steps" style={{ counterReset: `guide-step ${(start ?? 1) - 1}` }}>
                            {children}
                        </ol>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-3 list-outside list-disc space-y-2 pl-5 marker:text-cream-500/70">
                            {children}
                        </ul>
                    ),
                    li: ({ children }) => <li className="pl-1">{children}</li>,

                    table: ({ children }) => (
                        <div className="my-5 overflow-x-auto rounded-2xl border border-cream-200/8">
                            <table className="w-full text-left text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-cocoa-800/70">{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-2.5 font-semibold text-cream-100">{children}</th>,
                    tr: ({ children }) => <tr className="border-t border-cocoa-700/70">{children}</tr>,
                    td: ({ children }) => <td className="px-4 py-2.5 align-top">{children}</td>,

                    iframe: ({ className, ...props }) => {
                        const src = String(props.src ?? "");
                        if (!allowedIframe(src)) return null;
                        return (
                            <iframe
                                allow="clipboard-write; fullscreen"
                                className={cn("mt-4 aspect-video w-full rounded-2xl border border-cream-200/8", className)}
                                {...props}
                            />
                        );
                    },

                    mark: ({ children }) => (
                        <span className="my-3 flex items-start gap-2.5 rounded-2xl border border-cream-300/15 bg-cream-500/8 px-4 py-3 text-cream-100/80">
                            <Info className="mt-0.5 size-4 shrink-0 text-cream-400" />
                            <span>{children}</span>
                        </span>
                    )
                }}
            >
                {prepared}
            </ReactMarkdown>
        </div>
    );
}


function Heading({ level, id, children }: { level: 1 | 2 | 3, id: string, children: React.ReactNode }) {
    const Tag = `h${level}` as const;
    const size = {
        1: "text-3xl sm:text-4xl mt-10 mb-4",
        2: "text-2xl mt-9 mb-3",
        3: "text-xl mt-7 mb-2"
    }[level];

    return (
        <Tag id={id} className={cn("group scroll-mt-28 font-display tracking-tight text-cream-100 first:mt-0", size)}>
            <a href={`#${id}`} className="inline-flex items-baseline gap-2">
                {children}
                <span className="text-cream-500/0 transition-colors group-hover:text-cream-500/60">#</span>
            </a>
        </Tag>
    );
}

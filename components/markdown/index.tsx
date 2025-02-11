import { ExternalLink, ExclamationCircle } from "@/components/icons";
import { Channel, Emoji, Timestamp, User } from "./discord";
import { getBaseUrl } from "@/utils/urls";
import { Code } from "@nextui-org/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import ImageModal from "./image";
import Link from "next/link";
import cn from "@/utils/cn";


const ALLOWED_IFRAMES = [
    "https://www.youtube.com/embed/",
    "https://e.widgetbot.io/channels/",
    getBaseUrl()
] as const;


export default async function BeautifyMarkdown({ markdown }: { markdown: string; }) {
    const { renderToString } = await import("react-dom/server");

    function parseDiscordMarkdown(content: string) {
        return content
            .replace(/__(.*?)__/g, "<u>$1</u>")
            .replace(/<a?:\w{2,32}:\d{15,21}>/g, (match) => {
                const emojiId = match.match(/\d{15,21}/)?.[0] as string;
                return renderToString(<Emoji emojiId={emojiId} />);
            })
            .replace(/<(@!?)\w+>/g, (match) => {
                const userName = match.replace(/<|!|>|@/g, "");
                return renderToString(<User userName={userName} />);
            })
            .replace(/<(@&)\w+>/g, (match) => {
                const roleName = match.replace(/<|&|>|@/g, "");
                return renderToString(<User userName={roleName?.replaceAll("_", " ")} />);
            })
            .replace(/<(#!?)\w+>/g, (match) => {
                const channelName = match.replace(/<|!|>|#/g, "");
                return renderToString(<Channel channelName={channelName} />);
            })
            .replace(/<t:\d{1,10}:[Rf]?>/g, (match) => {
                const timestamp = match.match(/\d{1,10}/)?.[0] as string;
                const format = match.match(/:\w*?>/)?.[0] || "f";
                return renderToString(<Timestamp unix={parseInt(timestamp)} format={format.slice(1, -1)} />);
            })
    }

    function createHId(text: React.ReactNode) {
        return text?.toString().toLowerCase().replace(/ +/g, "-");
    }


    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
                h1: (props) => (
                    <Link href={`#${createHId(props.children)}`} className="flex mt-10 mb-3 cursor-pointer text-neutral-100">
                        <h1 id={createHId(props.children)} className="text-3xl font-semibold" {...props} />
                    </Link>
                ),
                h2: (props) => (
                    <Link href={`#${createHId(props.children)}`} className="flex mt-6 mb-2 cursor-pointer text-neutral-100">
                        <h2 id={createHId(props.children)} className="text-2xl font-semibold" {...props} />
                    </Link>
                ),
                h3: (props) => (
                    <Link href={`#${createHId(props.children)}`} className="flex mt-6 mb-2 cursor-pointer text-neutral-100">
                        <h3 id={createHId(props.children)} className="text-xl font-semibold" {...props} />
                    </Link>
                ),

                strong: (props) => <span className="font-semibold text-neutral-100" {...props} />,
                i: (props) => <span className="italic" {...props} />,
                del: (props) => <span className="line-through" {...props} />,
                ins: (props) => <span className="underline" {...props} />,

                // @ts-expect-error inline does exist
                code: ({ inline,  ref, color, ...props }) => {
                    if (inline) return <Code className="!bg-oreo-700/20 !text-oreo-600" {...props} />
                    return (
                        <div className="bg-dark-900 border-dark-950 text-neutral-200 rounded-md p-3 my-2 break-all"
                            {...props}
                        />
                    )
                },

                img: ({ alt = "image", src, ...props }) => {
                    const isFullWidth = src?.includes("fullwidth=true");
                    if (isFullWidth) return (
                        <ImageModal alt={alt} src={`${src?.split('?')[0]}`} mobileSrc={`${src?.split('?')[0]}`.replace('guide-assets', 'guide-mobile')} />
                    )
                    return (
                        <span className="w-fit items-center inline max-w-lg" >
                            <img alt={alt} className="rounded-md" loading="lazy" src={src?.split('?')[0]} {...props} />
                            {alt && alt !== "emoji" && <span aria-hidden="true" className="text-neutral-500 font-medium relative bottom-1">{alt}</span>}
                        </span>
                    )
                },

                a: ({ href, children, ...props }) => {
                    const isInternal = (href && href.includes('target=_self'));
                    const url = href && href.startsWith('/') ? href.split('?')[0] : href ?? "#";
                    return (
                        <Link
                            href={url}
                            target={isInternal ? "_self" : "_blank"}
                            className="text-oreo-600 hover:underline"
                        >
                            {children} {!isInternal ? <ExternalLink className="inline mb-0.5"/> : <></>}
                        </Link>
                    )
                },

                table: (props) => <table className="mt-5 table-auto w-full divide-y-1 divide-transparent overflow-scroll" {...props} />,
                th: ({ ...props }) => <th className="px-2 pb-2 font-medium text-neutral-200 text-left" {...props} />,
                tr: ({ ...props }) => <tr className="divide-x-1 divide-transparent" {...props} />,
                td: ({ ...props }) => <td className="px-2 py-1 divide-x-8 divide-transparent break-all" {...props} />,

                iframe: ({ className, ...props }) => {
                    if (ALLOWED_IFRAMES.some((url) => props.src?.startsWith(url))) {
                        return (
                            <iframe 
                                allow="clipboard-write; fullscreen"
                                className={cn("w-full rounded-lg mt-4", className)}
                                {...props}
                            />
                        )
                    }
                    return (<></>);
                },

                ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-1 marker:text-neutral-200/40 marker:mr-4 text-neutral-300 my-1" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc list-inside space-y-1 marker:text-neutral-200/40 text-neutral-300 my-1" {...props} />,
                p: (props) => <span {...props} />,

                mark: ({ children }) => (
                    <div className="w-full flex flex-row items-center text-neutral-100 bg-oreo-700/20 rounded-md py-2 px-4 mt-2 mb-0 gap-2">
                        <div className="flex items-center gap-2">
                            <ExclamationCircle className="shrink-0 md:w-5 w-8 text-oreo-700" />
                            <div className="text-medium">
                                {children}
                            </div>
                        </div>
                    </div>
                )
            }}
        >
            {parseDiscordMarkdown(markdown)}
        </ReactMarkdown>
    )
}
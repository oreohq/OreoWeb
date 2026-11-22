"use client";

import { discordTimestamp, intToHex } from "@/lib/dashboard/format";
import { Fragment, useState } from "react";
import cn from "@/lib/cn";



export interface MarkdownContext {
    roles?: ReadonlyMap<string, { name: string, color: number }>;
    channels?: ReadonlyMap<string, { name: string }>;
    users?: ReadonlyMap<string, { name: string }>;
    now?: number;
}

type Mode = "full" | "inline";
interface Options {
    context: MarkdownContext;
    links: boolean | "inert";
}

interface Props {
    content: string;
    context?: MarkdownContext;
    mode?: Mode;
    links?: boolean | "inert";
    className?: string;
}

const MAX_PARSED = 4096;

export function DiscordMarkdown({ content, context = {}, mode = "full", links = true, className }: Props) {
    const options: Options = { context, links };
    const parsed = content.length > MAX_PARSED ? content.slice(0, MAX_PARSED) : content;
    const nodes = mode === "full" ? parseBlocks(parsed, options, 0) : parseInline(parsed, options);
    if (parsed !== content) nodes.push(<Fragment key="rest">{content.slice(MAX_PARSED)}</Fragment>);
    return <div className={cn("min-w-0 whitespace-pre-wrap break-words", className)}>{nodes}</div>;
}


function parseBlocks(source: string, options: Options, depth: number): React.ReactNode[] {
    const lines = source.split("\n");
    const out: React.ReactNode[] = [];
    let paragraph: string[] = [];
    let key = 0;

    const flush = () => {
        if (!paragraph.length) return;
        out.push(<Fragment key={key++}>{parseInline(paragraph.join("\n"), options)}</Fragment>);
        paragraph = [];
    };
    const block = (node: React.ReactNode) => {
        flush();
        out.push(<Fragment key={key++}>{node}</Fragment>);
    };

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]!;

        if (line.startsWith("```")) {
            const sameLine = line.length > 3 ? line.slice(3).indexOf("```") : -1;
            if (sameLine !== -1) {
                block(<CodeBlock code={line.slice(3, 3 + sameLine)} />);
                continue;
            }
            const end = lines.findIndex((candidate, at) => at > index && candidate.includes("```"));
            if (end !== -1) {
                const body = [line.slice(3).replace(/^[\w+-]+$/, ""), ...lines.slice(index + 1, end), lines[end]!.slice(0, lines[end]!.indexOf("```"))]
                    .join("\n")
                    .replace(/^\n+|\n+$/g, "");
                block(<CodeBlock code={body} />);
                index = end;
                continue;
            }
        }

        if (depth === 0 && line.startsWith(">>> ")) {
            block(<Quote>{parseBlocks([line.slice(4), ...lines.slice(index + 1)].join("\n"), options, 1)}</Quote>);
            break;
        }

        if (depth === 0 && (line.startsWith("> ") || line === ">")) {
            const quoted: string[] = [];
            while (index < lines.length && (lines[index]!.startsWith("> ") || lines[index] === ">")) {
                quoted.push(lines[index]!.slice(2));
                index++;
            }
            index--;
            block(<Quote>{parseBlocks(quoted.join("\n"), options, 1)}</Quote>);
            continue;
        }

        const heading = /^(#{1,3}) +(\S.*)$/.exec(line);
        if (heading) {
            const level = heading[1]!.length as 1 | 2 | 3;
            block(<Heading level={level}>{parseInline(heading[2]!, options)}</Heading>);
            continue;
        }

        const subtext = /^-# +(\S.*)$/.exec(line);
        if (subtext) {
            block(<small className="block text-sm leading-[1.1rem] text-[#949BA4]">{parseInline(subtext[1]!, options)}</small>);
            continue;
        }

        if (/^\s*(?:[-*]|\d{1,9}\.) +\S/.test(line)) {
            const ordered = /^\s*\d/.test(line);
            const items: { indent: number, text: string, start: number }[] = [];
            while (index < lines.length) {
                const match = /^(\s*)([-*]|\d{1,9}\.) +(\S.*)$/.exec(lines[index]!);
                if (!match || /^\d/.test(match[2]!) !== ordered) break;
                items.push({ indent: match[1]!.length, text: match[3]!, start: parseInt(match[2]!, 10) || 1 });
                index++;
            }
            index--;
            block(<List ordered={ordered} start={items[0]?.start ?? 1} items={items} options={options} />);
            continue;
        }

        paragraph.push(line);
    }

    flush();
    return out;
}


function Heading({ level, children }: { level: 1 | 2 | 3, children: React.ReactNode }) {
    const size = { 1: "text-[1.5rem] leading-[1.375]", 2: "text-[1.25rem] leading-[1.375]", 3: "text-[1rem] leading-[1.375]" }[level];
    return <span className={cn("my-1 block font-bold text-[#F2F3F5]", size)}>{children}</span>;
}

function Quote({ children }: { children: React.ReactNode }) {
    return (
        <span className="my-0.5 flex">
            <span className="mr-2 w-1 shrink-0 rounded-sm bg-[#4E5058]" aria-hidden="true" />
            <span className="block min-w-0 flex-1">{children}</span>
        </span>
    );
}

function CodeBlock({ code }: { code: string }) {
    return (
        <pre className="my-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-[#1E1F22] bg-[#2B2D31] p-2 font-mono text-sm leading-[1.125rem] text-[#DBDEE1]">
            <code>{code}</code>
        </pre>
    );
}

function List({ ordered, start, items, options }: { ordered: boolean, start: number, items: { indent: number, text: string }[], options: Options }) {
    const Tag = ordered ? "ol" : "ul";
    return (
        <Tag start={ordered ? start : undefined} className={cn("my-0.5 ml-4 space-y-0.5", ordered ? "list-decimal" : "list-disc")}>
            {items.map((item, index) => (
                <li key={index} style={{ marginLeft: Math.min(item.indent, 8) * 4 }} className="marker:text-[#DBDEE1]/70">
                    {parseInline(item.text, options)}
                </li>
            ))}
        </Tag>
    );
}


interface Rule {
    pattern: RegExp;
    accept?: (match: RegExpExecArray, before: string) => boolean;
    render: (match: RegExpExecArray, options: Options, key: number) => React.ReactNode;
}

const URL_TAIL = /[.,:;"')\]]+$/;

const rules: Rule[] = [
    {
        pattern: /\\([^0-9A-Za-z\s])/y,
        render: (match) => match[1]
    },
    {
        pattern: /\n/y,
        render: (_match, _options, key) => <br key={key} />
    },
    {
        pattern: /<(https?:\/\/[^\s>]+)>/y,
        render: (match, options, key) => <Link key={key} href={match[1]!} enabled={options.links}>{match[1]}</Link>
    },
    {
        pattern: /<@&(\d{17,20})>/y,
        render: (match, options, key) => {
            const role = options.context.roles?.get(match[1]!);
            return <RoleMention key={key} name={role?.name ?? "unknown-role"} color={role?.color ?? 0} />;
        }
    },
    {
        pattern: /<@!?(\d{17,20})>/y,
        render: (match, options, key) => (
            <Mention key={key}>@{options.context.users?.get(match[1]!)?.name ?? "unknown-user"}</Mention>
        )
    },
    {
        pattern: /<#(\d{17,20})>/y,
        render: (match, options, key) => (
            <Mention key={key}>#{options.context.channels?.get(match[1]!)?.name ?? "unknown"}</Mention>
        )
    },
    {
        pattern: /<t:(-?\d{1,13})(?::([tTdDfFR]))?>/y,
        render: (match, options, key) => (
            <span key={key} className="rounded-[3px] bg-white/[0.06] px-[2px]">
                {discordTimestamp(parseInt(match[1]!, 10), match[2] ?? "f", options.context.now)}
            </span>
        )
    },
    {
        pattern: /<(a?):(\w{2,32}):(\d{17,20})>/y,
        render: (match, _options, key) => (
            <img
                key={key}
                src={`https://cdn.discordapp.com/emojis/${match[3]}.${match[1] ? "gif" : "webp"}?size=44`}
                alt={`:${match[2]}:`}
                title={`:${match[2]}:`}
                className="inline-block size-[1.375em] object-contain align-bottom"
                loading="lazy"
            />
        )
    },
    {
        pattern: /@(everyone|here)/y,
        render: (match, _options, key) => <Mention key={key}>@{match[1]}</Mention>
    },
    {
        pattern: /\[((?:\\[\s\S]|[^\[\]\\\n])+)\]\(\s*<?(https?:\/\/[^\s)>]+)>?\s*\)/y,
        render: (match, options, key) => (
            <Link key={key} href={match[2]!} enabled={options.links} title={match[2]}>
                {parseInline(match[1]!, { ...options, links: false })}
            </Link>
        )
    },
    {
        pattern: /https?:\/\/[^\s<]+[^\s<.,:;"')\]]/y,
        render: (match, options, key) => <Link key={key} href={match[0].replace(URL_TAIL, "")} enabled={options.links}>{match[0]}</Link>
    },
    {
        pattern: /\*\*([\s\S]+?)\*\*(?!\*)/y,
        render: (match, options, key) => <strong key={key} className="font-bold">{parseInline(match[1]!, options)}</strong>
    },
    {
        pattern: /__([\s\S]+?)__(?!_)/y,
        render: (match, options, key) => <u key={key}>{parseInline(match[1]!, options)}</u>
    },
    {
        // One token per step so nothing overlaps and there is no catastrophic backtracking
        pattern: /\*(?![\s*])((?:\\[\s\S]|[^\\*]|\*\*(?=[^*]))+?)(?<![\s\\])\*(?!\*)/y,
        render: (match, options, key) => <em key={key}>{parseInline(match[1]!, options)}</em>
    },
    {
        pattern: /_((?:__|\\[\s\S]|[^\\_])+?)_(?![A-Za-z0-9])/y,
        accept: (_match, before) => !/[A-Za-z0-9]/.test(before),
        render: (match, options, key) => <em key={key}>{parseInline(match[1]!, options)}</em>
    },
    {
        pattern: /~~([\s\S]+?)~~/y,
        render: (match, options, key) => <s key={key}>{parseInline(match[1]!, options)}</s>
    },
    {
        pattern: /\|\|([\s\S]+?)\|\|/y,
        render: (match, options, key) => <Spoiler key={key}>{parseInline(match[1]!, options)}</Spoiler>
    }
];

const SPECIAL = new Set(["\\", "\n", "`", "<", "@", "[", "h", "*", "_", "~", "|"]);


function parseInline(source: string, options: Options): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    let text = "";
    let key = 0;
    let index = 0;

    const pushText = () => {
        if (text) out.push(text);
        text = "";
    };

    outer: while (index < source.length) {
        const char = source[index]!;
        if (char === "`") {
            let run = 1;
            while (source[index + run] === "`") run++;
            const fence = "`".repeat(run);
            let from = index + run;
            let close = -1;
            for (;;) {
                const at = source.indexOf(fence, from);
                if (at === -1) break;
                let end = at + run;
                if (source[end] !== "`") {
                    close = at;
                    break;
                }
                while (source[end] === "`") end++;
                from = end;
            }
            if (close === -1) {
                text += fence;
                index += run;
                continue;
            }
            const code = source.slice(index + run, close);
            pushText();
            out.push(
                <code key={key++} className="rounded-[4px] border border-[#1E1F22] bg-[#2B2D31] px-[0.25em] py-px font-mono text-[0.85em] text-[#DBDEE1]">
                    {code.trim() || code}
                </code>
            );
            index = close + run;
            continue;
        }
        if (SPECIAL.has(char)) {
            for (const rule of rules) {
                rule.pattern.lastIndex = index;
                const match = rule.pattern.exec(source);
                if (!match || match[0].length === 0) continue;
                if (rule.accept && !rule.accept(match, source[index - 1] ?? "")) continue;

                pushText();
                out.push(rule.render(match, options, key++));
                index += match[0].length;
                continue outer;
            }
        }
        text += char;
        index++;
    }

    pushText();
    return out.map((node, at) => (typeof node === "string" ? <Fragment key={`t${at}`}>{node}</Fragment> : node));
}


function Link({ href, enabled, title, children }: { href: string, enabled: boolean | "inert", title?: string, children: React.ReactNode }) {
    if (!enabled) return <>{children}</>;
    if (enabled === "inert") return <span className="text-[#00A8FC]">{children}</span>;
    return (
        <a href={href} target="_blank" rel="noreferrer noopener" title={title} className="text-[#00A8FC] hover:underline">
            {children}
        </a>
    );
}

function Mention({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-[3px] bg-[#5865F2]/30 px-[2px] font-medium text-[#C9CDFB] transition-colors hover:bg-[#5865F2] hover:text-white">
            {children}
        </span>
    );
}

function RoleMention({ name, color }: { name: string, color: number }) {
    return (
        <Mention>
            {color > 0 && (
                <span
                    className="mr-0.5 inline-block size-2 rounded-full align-middle"
                    style={{ backgroundColor: intToHex(color) }}
                    aria-hidden="true"
                />
            )}
            @{name}
        </Mention>
    );
}

function Spoiler({ children }: { children: React.ReactNode }) {
    const [revealed, setRevealed] = useState(false);
    return (
        <span
            role="button"
            tabIndex={0}
            aria-label={revealed ? undefined : "Spoiler, press to reveal"}
            data-revealed={revealed}
            onClick={() => setRevealed(true)}
            onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && setRevealed(true)}
            className="discord-spoiler px-[2px]"
        >
            {children}
        </span>
    );
}

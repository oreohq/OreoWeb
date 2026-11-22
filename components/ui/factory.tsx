import type { CSSProperties } from "react";
import cn from "@/lib/cn";


/** Must match `factory-belt` in globals.css */
const PITCH = 90;
const BELT_Y = 232;
const SLOTS = [110, 110 + PITCH, 110 + PITCH * 2, 110 + PITCH * 3, 110 + PITCH * 4];

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const TICKER = "ERR 404 · PAGE NOT FOUND · LINE STILL RUNNING ·";


export function OreoFactory({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 660 330"
            className={cn("factory w-full", className)}
            role="img"
            aria-label="An Oreo production line baking, filling and stamping cookies, with a sign reading error 404, page not found"
        >
            <defs>
                <linearGradient id="f404-machine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cocoa-600)" />
                    <stop offset="100%" stopColor="#1D1C23" />
                </linearGradient>
                <linearGradient id="f404-belt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cocoa-500)" />
                    <stop offset="100%" stopColor="#1F1F2B" />
                </linearGradient>
                <linearGradient id="f404-fire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cream-350)" />
                    <stop offset="100%" stopColor="var(--color-cream-700)" />
                </linearGradient>
                <linearGradient id="f404-mouth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cream-700)" stopOpacity="0.4" />
                    <stop offset="35%" stopColor="var(--color-cocoa-900)" />
                    <stop offset="100%" stopColor="var(--color-cocoa-950)" />
                </linearGradient>
                <linearGradient id="f404-scan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-ok)" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="var(--color-ok)" stopOpacity="0.04" />
                </linearGradient>
                <radialGradient id="f404-glow" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="var(--color-cream-500)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--color-cream-500)" stopOpacity="0" />
                </radialGradient>
                <pattern id="f404-led" width="3" height="3" patternUnits="userSpaceOnUse">
                    <rect width="3" height="1" fill="var(--color-cocoa-900)" opacity="0.7" />
                </pattern>
                <clipPath id="f404-belt-clip">
                    <rect x="48" y="232" width="470" height="18" rx="9" />
                </clipPath>
                <clipPath id="f404-ticker-clip">
                    <rect x="184" y="17" width="216" height="22" />
                </clipPath>
                <clipPath id="f404-tank-clip">
                    <rect x="92" y="94" width="40" height="22" rx="5" />
                </clipPath>
            </defs>

            <ellipse cx="330" cy="296" rx="310" ry="44" fill="url(#f404-glow)" opacity="0.55" />
            <line x1="12" y1="313.5" x2="648" y2="313.5" stroke="var(--color-cocoa-600)" strokeWidth="1.5" strokeLinecap="round" />

            <rect x="172" y="72" width="8" height="241" fill="var(--color-cocoa-700)" />
            <rect x="410" y="72" width="8" height="241" fill="var(--color-cocoa-700)" />
            <rect x="442" y="172" width="6" height="78" rx="2" fill="var(--color-cocoa-600)" />
            <rect x="492" y="172" width="6" height="78" rx="2" fill="var(--color-cocoa-600)" />

            <rect x="528" y="256" width="100" height="58" rx="4" fill="#15141C" />
            <image href="/Icon.svg" x="536" y="250" width="32" height="32" transform="rotate(-14 552 266)" />
            <image href="/Icon.svg" x="590" y="252" width="32" height="32" transform="rotate(18 606 268)" />
            <image href="/Icon.svg" x="563" y="243" width="34" height="34" transform="rotate(4 580 260)" />

            <path d="M130 250V216Q130 204 142 204H166V250Z" fill="url(#f404-mouth)" />
            {[76, 296, 486].map((x) => (
                <g key={x}>
                    <rect x={x} y="248" width="8" height="64" fill="var(--color-cocoa-700)" />
                    <rect x={x - 6} y="308" width="20" height="5" rx="2" fill="var(--color-cocoa-600)" />
                </g>
            ))}
            <rect x="48" y="232" width="470" height="18" rx="9" fill="url(#f404-belt)" stroke="var(--color-cocoa-500)" />
            <g clipPath="url(#f404-belt-clip)">
                <g className="factory-belt">
                    {Array.from({ length: 34 }).map((_, i) => (
                        <rect key={i} x={-42 + i * 18} y="234.5" width="8" height="3" rx="1.5" fill="var(--color-cocoa-400)" opacity="0.6" />
                    ))}
                </g>
            </g>
            {[60, 506].map((x) => (
                <g key={x} transform={`translate(${x} 241)`}>
                    <g className="factory-roller">
                        <circle r="6.5" fill="var(--color-cocoa-600)" stroke="var(--color-cocoa-400)" strokeWidth="1.2" />
                        <path d="M-4 0H4M0 -4V4" stroke="var(--color-cocoa-300)" strokeWidth="1.4" strokeLinecap="round" />
                    </g>
                </g>
            ))}

            <g className="factory-belt">
                <g transform={`translate(${SLOTS[0]} ${BELT_Y})`}>
                    <Wafer y={-8} />
                </g>
                <g transform={`translate(${SLOTS[1]} ${BELT_Y})`}>
                    <Wafer y={-8} />
                    <Cream />
                </g>
                <g transform={`translate(${SLOTS[2]} ${BELT_Y})`}>
                    <Wafer y={-8} />
                    <Cream />
                    <Wafer y={-21} />
                </g>
                <g transform={`translate(${SLOTS[3]} ${BELT_Y})`}>
                    <Upright />
                </g>
                <g transform={`translate(${SLOTS[4]} ${BELT_Y})`}>
                    <g className="factory-drop">
                        <Upright />
                    </g>
                </g>
            </g>

            <g>
                <circle className="factory-steam" cx="43" cy="80" r="7" fill="var(--color-cocoa-300)" />
                <circle className="factory-steam" cx="43" cy="80" r="6" fill="var(--color-cocoa-300)" style={{ animationDelay: "1s" }} />
                <circle className="factory-steam" cx="43" cy="80" r="8" fill="var(--color-cocoa-300)" style={{ animationDelay: "2s" }} />
                <rect x="34" y="90" width="18" height="36" rx="3" fill="var(--color-cocoa-700)" stroke="var(--color-cocoa-500)" />
                <rect x="30" y="86" width="26" height="6" rx="2" fill="var(--color-cocoa-600)" stroke="var(--color-cocoa-500)" />

                <path d="M142 99H186Q200 99 200 113V150" fill="none" stroke="var(--color-cocoa-500)" strokeWidth="8" />
                <path d="M142 99H186Q200 99 200 113V150" fill="none" stroke="var(--color-cocoa-400)" strokeWidth="2" opacity="0.5" />
                <rect x="82" y="84" width="60" height="42" rx="10" fill="url(#f404-machine)" stroke="var(--color-cocoa-500)" />
                <rect x="92" y="94" width="40" height="22" rx="5" fill="var(--color-cocoa-900)" />
                <g clipPath="url(#f404-tank-clip)">
                    <g className="factory-slosh">
                        <path d="M88 104Q100 101 112 104T136 104V120H88Z" fill="var(--color-cream-150)" />
                    </g>
                </g>
                <rect x="96" y="96" width="3" height="18" rx="1.5" fill="#FFFFFF" opacity="0.08" />

                <path
                    d="M34 124H152Q166 124 166 138V204H142Q130 204 130 216V252H34Q20 252 20 238V138Q20 124 34 124Z"
                    fill="url(#f404-machine)"
                    stroke="var(--color-cocoa-500)"
                />
                <path d="M131 210Q133 205 142 205H166" fill="none" stroke="var(--color-cream-700)" strokeWidth="1.5" opacity="0.5" />
                <rect x="36" y="144" width="84" height="46" rx="9" fill="var(--color-cocoa-900)" />
                <rect className="factory-flicker" x="40" y="148" width="76" height="38" rx="6" fill="url(#f404-fire)" />
                <path d="M44 172H112M44 162H112" stroke="#8A3A1C" strokeWidth="1.5" opacity="0.45" />
                <path d="M48 151L60 151L50 183L42 183Z" fill="#FFFFFF" opacity="0.12" />

                <circle cx="146" cy="164" r="11" fill="var(--color-cocoa-900)" stroke="var(--color-cocoa-500)" />
                <path d="M139 168A8 8 0 0 1 153 168" fill="none" stroke="var(--color-cocoa-500)" strokeWidth="1.5" />
                <line className="factory-gauge" x1="146" y1="164" x2="146" y2="156.5" stroke="var(--color-cream-500)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="146" cy="164" r="1.8" fill="var(--color-cream-500)" />

                <text x="38" y="214" fontFamily={MONO} fontSize="9" fontWeight="700" letterSpacing="2" fill="var(--color-cocoa-400)">
                    OVEN 01
                </text>
                <circle cx="42" cy="232" r="3.5" fill="var(--color-ok)" opacity="0.9" />
                <circle cx="54" cy="232" r="3.5" fill="var(--color-cocoa-500)" />

            </g>

            <g className="factory-tool" style={{ "--d": "14px" } as CSSProperties}>
                <rect x="196" y="128" width="8" height="24" fill="var(--color-cocoa-500)" />
                <rect x="187" y="150" width="26" height="24" rx="5" fill="url(#f404-machine)" stroke="var(--color-cocoa-500)" />
                <path d="M191 174H209L203 186H197Z" fill="var(--color-cocoa-400)" />
                <circle cx="200" cy="162" r="2.5" fill="var(--color-cream-150)" />
            </g>
            <rect className="factory-drip" x="197" y="200" width="6" height="24" rx="3" fill="var(--color-cream-150)" />
            <rect x="190" y="144" width="20" height="10" rx="3" fill="var(--color-cocoa-600)" stroke="var(--color-cocoa-500)" />

            <g className="factory-tool" style={{ "--d": "33px" } as CSSProperties}>
                <rect x="285" y="80" width="10" height="96" fill="var(--color-cocoa-400)" />
                <rect x="262" y="174" width="56" height="12" rx="4" fill="var(--color-cream-500)" />
                <rect x="266" y="176" width="48" height="2.5" rx="1.25" fill="#FFFFFF" opacity="0.3" />
            </g>
            <rect x="272" y="72" width="36" height="52" rx="5" fill="url(#f404-machine)" stroke="var(--color-cocoa-500)" />
            <path d="M279 86H301M279 94H301M279 102H301" stroke="var(--color-cocoa-500)" strokeWidth="2" strokeLinecap="round" />

            <g className="factory-tool" style={{ "--d": "64px" } as CSSProperties}>
                <rect x="375" y="44" width="10" height="112" fill="var(--color-cocoa-400)" />
                <rect x="350" y="110" width="60" height="56" rx="12" fill="url(#f404-machine)" stroke="var(--color-cocoa-500)" />
                <circle cx="371" cy="132" r="2.6" fill="var(--color-cream-500)" />
                <circle cx="389" cy="132" r="2.6" fill="var(--color-cream-500)" />
                <path d="M371 141Q380 149 389 141" fill="none" stroke="var(--color-cream-500)" strokeWidth="2.4" strokeLinecap="round" />
                <rect x="356" y="158" width="48" height="3" rx="1.5" fill="var(--color-cocoa-900)" opacity="0.6" />
            </g>
            <rect x="362" y="72" width="36" height="36" rx="5" fill="url(#f404-machine)" stroke="var(--color-cocoa-500)" />

            <rect x="166" y="58" width="258" height="14" rx="3" fill="var(--color-cocoa-600)" stroke="var(--color-cocoa-500)" />
            {[["CREAM", 200], ["PRESS", 290], ["SMILE", 380]].map(([label, x]) => (
                <text
                    key={label}
                    x={x}
                    y="68"
                    textAnchor="middle"
                    fontFamily={MONO}
                    fontSize="7.5"
                    fontWeight="700"
                    letterSpacing="1.5"
                    fill="var(--color-cocoa-300)"
                >
                    {label}
                </text>
            ))}
            <rect x="210" y="44" width="4" height="14" fill="var(--color-cocoa-500)" />
            <rect x="370" y="44" width="4" height="14" fill="var(--color-cocoa-500)" />
            <rect x="176" y="12" width="232" height="32" rx="6" fill="var(--color-cocoa-900)" stroke="var(--color-cocoa-600)" />
            <g clipPath="url(#f404-ticker-clip)">
                <g className="factory-ticker">
                    {[188, 188 + 330].map((x) => (
                        <text
                            key={x}
                            x={x}
                            y="33"
                            textLength="330"
                            lengthAdjust="spacing"
                            fontFamily={MONO}
                            fontSize="13"
                            fontWeight="700"
                            fill="var(--color-cream-500)"
                        >
                            {TICKER}
                        </text>
                    ))}
                </g>
                <rect x="184" y="17" width="216" height="22" fill="url(#f404-led)" />
            </g>

            <rect className="factory-scan" x="448" y="180" width="44" height="52" fill="url(#f404-scan)" />
            <rect x="436" y="166" width="68" height="14" rx="4" fill="var(--color-cocoa-600)" stroke="var(--color-cocoa-500)" />
            <text x="445" y="176" fontFamily={MONO} fontSize="7.5" fontWeight="700" letterSpacing="1.5" fill="var(--color-cocoa-300)">
                QA
            </text>
            <circle className="factory-lamp" cx="494" cy="173" r="3" fill="var(--color-cocoa-500)" />

            <rect x="522" y="268" width="112" height="46" rx="6" fill="url(#f404-machine)" stroke="var(--color-cocoa-500)" />
            <path d="M530 276H626" stroke="var(--color-cocoa-500)" strokeWidth="1.5" strokeLinecap="round" />
            <text
                x="578"
                y="302"
                textAnchor="middle"
                fontSize="20"
                letterSpacing="1"
                fill="var(--color-cream-500)"
                style={{ fontFamily: "var(--font-display)" }}
            >
                OREO
            </text>
        </svg>
    );
}


function Wafer({ y }: { y: number }) {
    return (
        <g>
            <rect x="-20" y={y} width="40" height="8" rx="3" fill="#573738" stroke="var(--color-cream-950)" strokeWidth="1.5" />
            {[-12, -4, 4, 12].map((x) => (
                <rect key={x} x={x - 1} y={y + 2.5} width="2" height="3" rx="1" fill="#6C504E" />
            ))}
        </g>
    );
}


function Cream() {
    return <rect x="-17" y="-13" width="34" height="5" rx="2" fill="var(--color-cream-150)" stroke="var(--color-cream-950)" strokeWidth="1.2" />;
}


function Upright() {
    return (
        <g className="factory-roll">
            <image href="/Icon.svg" x="-20" y="-40" width="40" height="40" />
        </g>
    );
}

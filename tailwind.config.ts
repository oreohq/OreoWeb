import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";


const config: Config = {
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                blurple: "#5865f2",
                oreoblue: "#5577FF",
                background: "var(--background)",
                oreo: {
                    500: "#FEBD9F",
                    600: "var(--primary)",
                    700: "#FF996A"
                },
                dark: {
                    DEFAULT: "var(--background)",
                    600: "#292938",
                    700: "#232330",
                    800: "#1A1A24",
                    900: "var(--background)",
                    950: "#0F0F15"
                },
                status: {
                    green: "#09B079",
                    orange: "#F59A4A",
                    blue: "#5577FF",
                    red: "#FF5959"
                }
            },
            width: {
                "1.25": "0.313rem",
                "128": "32rem",
                "160": "40rem"
            },
            height: {
                "7.5": "1.875rem"
            },
            fontSize: {
                "xxs": "0.6rem"
            },
            gridTemplateColumns: {
                "25": "repeat(25, minmax(0, 1fr))",
                "30": "repeat(30, minmax(0, 1fr))",
                "90": "repeat(90, minmax(0, 1fr))",
            },
            spacing: {
                "100": "28rem"
            },
            animation: {
                "infinite-scroll": "infinite-scroll 40s linear infinite",
                "infinite-scroll-invert": "infinite-scroll-invert 40s linear infinite",
                "scroll": "scroll 2.5s ease infinite"
            },
            keyframes: {
                "infinite-scroll": {
                  from: { transform: "translateX(0)" },
                  to: { transform: "translateX(-100%)" },
                },
                "infinite-scroll-invert": {
                  from: { transform: "translateX(-100%)" },
                  to: { transform: "translateX(0%)" },
                },
                "scroll": {
                    "0%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(0.5rem)" },
                    "51%": { opacity: "1" },
                    100: { opacity: "0", transform: "translateY(0)" }
                }
            },
            backgroundImage: {
                'guild-list': 'linear-gradient(to right, transparent 0, black 150px, black calc(100%-150px), transparent 100%)'
            }
        }
    },
    darkMode: "class",
    plugins: [nextui({
        addCommonColors: false,
        layout: {
            radius: {
                small: "0.375rem",
                medium: "0.5rem",
                large: "0.75rem"
            },
            fontSize: {
                small: "0.875rem",
                medium: "1rem",
                large: "1.125rem"
            }
        }
    })]
}


export default config;
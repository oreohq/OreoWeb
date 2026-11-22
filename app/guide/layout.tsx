import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider";
import { GuideBar } from "@/components/site/guide-bar";
import { NavBar } from "@/components/site/navbar";
import { source } from "@/lib/source";


export default function GuideLayout({ children }: { children: React.ReactNode }) {
    return (
        // The site is dark only, and an inline theme script would break the CSP
        <RootProvider theme={{ enabled: false }}>
            <DocsLayout
                tree={source.pageTree}
                themeSwitch={{ enabled: false }}
                nav={{
                    title: <span className="font-display text-xl text-cream-100">Guide</span>,
                    url: "/guide",
                    component: (
                        <>
                            <NavBar bar />
                            <GuideBar />
                        </>
                    )
                }}
            >
                {children}
            </DocsLayout>
        </RootProvider>
    );
}

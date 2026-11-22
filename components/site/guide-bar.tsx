"use client";

import { SearchToggle } from "fumadocs-ui/components/layout/search-toggle";
import { SidebarTrigger } from "fumadocs-ui/components/layout/sidebar";
import { PanelLeft } from "lucide-react";


export function GuideBar() {
    return (
        <div className="fixed inset-x-3 top-[4.75rem] z-40 flex items-center rounded-2xl border border-cream-200/10 bg-cocoa-900/90 p-1.5 shadow-lg shadow-black/40 backdrop-blur-xl sm:inset-x-5 md:hidden">
            <SidebarTrigger className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-cream-100/80 hover:bg-cream-100/6 hover:text-cream-100">
                <PanelLeft className="size-4" />
                All pages
            </SidebarTrigger>
            <SearchToggle className="ml-auto" hideIfDisabled />
        </div>
    );
}

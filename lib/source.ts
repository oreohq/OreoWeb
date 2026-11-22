import { BellRing, Crown, LifeBuoy, Rocket, Users, Wrench } from "@/components/ui/glyphs";
import { PREMIUM_GUIDE_PAGES, premiumEnabled } from "@/lib/premium";
import { loader } from "fumadocs-core/source";
import { createElement } from "react";
import { guide } from "@/.source";

const icons = { BellRing, Crown, LifeBuoy, Rocket, Users, Wrench };

const mdx = guide.toFumadocsSource();
const hidden = new Set(premiumEnabled ? [] : [...PREMIUM_GUIDE_PAGES, "---[Crown]Premium---"]);
const files = mdx.files
    .filter((file) => file.type !== "page" || !hidden.has(file.path.replace(/\.mdx?$/, "")))
    .map((file) => (file.type === "meta" && file.data.pages ? { ...file, data: { ...file.data, pages: file.data.pages.filter((page) => !hidden.has(page)) } } : file));

export const source = loader({
    baseUrl: "/guide",
    source: { files },
    icon: (name) => (name && name in icons ? createElement(icons[name as keyof typeof icons]) : undefined)
});

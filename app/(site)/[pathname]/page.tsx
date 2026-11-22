import { redirect, notFound } from "next/navigation";
import { redirects } from "@/lib/urls";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "Page not found", robots: { index: false } };


interface Props {
    params: Promise<{ pathname: string }>;
}

export default async function RedirectPage({ params }: Props) {
    const { pathname } = await params;

    const target = redirects[pathname];
    if (target) redirect(target);

    if (["guides", "docs", "guide"].includes(pathname)) redirect("/guide/add");

    notFound();
}

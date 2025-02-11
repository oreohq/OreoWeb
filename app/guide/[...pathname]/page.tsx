import BeautifyMarkdown from "@/components/markdown";
import GuideMeta from "@/public/guide/meta.json";
import { Divider } from "@nextui-org/react";
import { redirect } from "next/navigation";
import { readFile } from "fs/promises";


const PATH = `${process.cwd()}/public/guide` as const;
type Props = { params: Promise<{ pathname: string[] }> };

export default async function Home({ params }: Props) {
    const { pathname } = await params;
    const markdown = await readFile(`${PATH}/${pathname.join("/").toLowerCase()}.md`, "utf-8").catch(() => null);
    const meta = GuideMeta.pages.find((page) => page.file === `${pathname.join("/").toLowerCase()}.md`);

    if (!markdown || !meta) return redirect("/guide/add");
    return (
        <article
            itemType="http://schema.org/Article"
            className="w-full lg:w-3/4 bg-dark-800 rounded-lg shadow-md p-4"
        >
            <div className="md:flex justify-between items-center">
                <h1 className="text-2xl font-medium text-neutral-100">
                    {meta.name}
                </h1>
            </div>

            <Divider className="my-4 rounded-full h-0.5 w-auto shadow-md bg-dark-600" />
            <BeautifyMarkdown markdown={markdown} />
        </article>
    )
}
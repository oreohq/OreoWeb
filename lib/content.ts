import { readFile } from "fs/promises";
import path from "path";


export async function getLegalContent(name: "terms" | "privacy"): Promise<string | null> {
    return await readFile(path.join(process.cwd(), "public", "legal", `${name}.md`), "utf-8").catch(() => null);
}

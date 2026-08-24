import { readFile } from "node:fs/promises";
export async function loadHtml(input) {
    if (input.startsWith("http://") || input.startsWith("https://")) {
        const resp = await fetch(input, {
            headers: { "user-agent": "lang-leak-checker/0.1" },
        });
        if (!resp.ok) {
            throw new Error(`fetch failed for ${input}: HTTP ${resp.status}`);
        }
        return await resp.text();
    }
    return await readFile(input, "utf-8");
}

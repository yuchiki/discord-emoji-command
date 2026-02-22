import { load } from "cheerio";

const LANGUAGE_PATTERN = /^[a-z]{2,20}(-[a-z]{2,20})*$/;

export const search_wikipedia = async (
    language: string,
    raw_word: string,
    protocol = "https",
    host = "wikipedia.org",
): Promise<string> => {
    if (!LANGUAGE_PATTERN.test(language)) {
        return `"${language}" is not a valid language code.`;
    }

    const word = encodeURIComponent(raw_word.replace(/ /g, "_"));
    const url = `${protocol}://${language}.${host}/wiki/${word}`;
    console.log(`request: ${url}`);

    const res = await fetch(url);

    if (res.status === 404) {
        console.log(`${url} is not found.`);
        return `${language}: "${raw_word}" is not found.`;
    }

    if (res.status >= 400) {
        console.log(`${url}: error code ${res.status}`);
        return `${language}: "${raw_word}": error code ${res.status}`;
    }

    const rawHTML = await res.text();

    if (rawHTML.trim().length === 0) {
        console.log(`${url}: HTML is empty.`);
        return `${language}: "${raw_word}" is not found.`;
    }

    console.log(`${url} is found.`);

    const HTML = load(rawHTML);
    const p0 = HTML(".mw-parser-output").find("p:eq(0)").text().trim();
    const p1 = HTML(".mw-parser-output").find("p:eq(1)").text().trim();
    const paragraphs = (p0 + p1).trim();

    if (!paragraphs) {
        return `${language}: "${raw_word}": empty.`;
    }

    const text = `${language}: "${raw_word}"\n${p0}${p1}\n${url}`;

    return text.replace(/\[[0-9]+\]/g, "");
};

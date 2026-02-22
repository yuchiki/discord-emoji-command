import { describe, expect, test } from "bun:test";
import { search_wikipedia } from "../../src/wikipedia";

const protocol = process.env["WIKIPEDIA_PROTOCOL"] ?? "https";
const host = process.env["WIKIPEDIA_HOST"] ?? "wikipedia.org";

const search = (language: string, word: string) =>
	search_wikipedia(language, word, protocol, host);

describe("Docker integration: search_wikipedia", () => {
	test("fetches a Japanese article", async () => {
		const result = await search("ja", "TypeScript");

		expect(result).toContain('ja: "TypeScript"');
		expect(result).toContain(
			"TypeScriptはJavaScriptを拡張して作られたプログラミング言語です。",
		);
		expect(result).toContain("マイクロソフトにより開発されました。");
	});

	test("fetches an English article", async () => {
		const result = await search("en", "TypeScript");

		expect(result).toContain('en: "TypeScript"');
		expect(result).toContain(
			"TypeScript is a programming language developed by Microsoft.",
		);
		expect(result).toContain("It is a superset of JavaScript.");
	});

	test("handles URL-encoded characters", async () => {
		const result = await search("en", "Bun (software)");

		expect(result).toContain('en: "Bun (software)"');
		expect(result).toContain("Bun is a JavaScript runtime.");
	});

	test("returns not found for nonexistent article", async () => {
		const result = await search("en", "NonExistentArticle");

		expect(result).toBe('en: "NonExistentArticle" is not found.');
	});

	test("strips citation markers", async () => {
		const result = await search("en", "Citations");

		expect(result).not.toMatch(/\[\d+\]/);
		expect(result).toContain("Text with citations and more.");
		expect(result).toContain("Another paragraph.");
	});

	test("rejects invalid language code", async () => {
		const result = await search("INVALID!", "TypeScript");

		expect(result).toBe('"INVALID!" is not a valid language code.');
	});

	test("parallel multi-language lookup", async () => {
		const results = await Promise.all([
			search("ja", "TypeScript"),
			search("en", "TypeScript"),
		]);

		expect(results[0]).toContain('ja: "TypeScript"');
		expect(results[1]).toContain('en: "TypeScript"');
	});
});

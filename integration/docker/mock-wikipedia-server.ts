const articles: Record<string, string> = {
	"ja/TypeScript": `<div class="mw-parser-output">
		<p>TypeScriptはJavaScriptを拡張して作られたプログラミング言語です。</p>
		<p>マイクロソフトにより開発されました。</p>
	</div>`,
	"en/TypeScript": `<div class="mw-parser-output">
		<p>TypeScript is a programming language developed by Microsoft.</p>
		<p>It is a superset of JavaScript.</p>
	</div>`,
	"en/Bun_(software)": `<div class="mw-parser-output">
		<p>Bun is a JavaScript runtime.</p>
		<p>It aims to be fast.</p>
	</div>`,
	"en/Citations": `<div class="mw-parser-output">
		<p>Text with citations[1] and[23] more.</p>
		<p>Another[4] paragraph.</p>
	</div>`,
};

Bun.serve({
	port: 3000,
	fetch(req) {
		const url = new URL(req.url);
		const host = req.headers.get("host") ?? "";
		const language = host.split(".")[0];
		const word = url.pathname.replace("/wiki/", "");
		const key = `${language}/${word}`;

		const html = articles[key];
		if (!html) {
			return new Response("Not Found", { status: 404 });
		}
		return new Response(html, {
			headers: { "Content-Type": "text/html" },
		});
	},
});

console.log("Mock Wikipedia server listening on port 3000");

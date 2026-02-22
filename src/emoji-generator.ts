import sharp from "sharp";

export interface EmojiOptions {
    text: string;
    color?: string | undefined;
    bg?: string | undefined;
    fontSize?: number | undefined;
}

const COLOR_PATTERN = /^(?:[a-zA-Z]+|#[0-9a-fA-F]{3,8})$/;

const escapeXml = (str: string): string =>
    str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const validateColor = (value: string): string => {
    if (!COLOR_PATTERN.test(value)) {
        throw new Error(`無効な色指定です: ${value}`);
    }
    return value;
};

const autoFontSize = (text: string): number => {
    const len = text.length;
    if (len <= 2) return 64;
    if (len <= 4) return 48;
    if (len <= 8) return 32;
    return 20;
};

const splitLines = (text: string, fontSize: number): string[] => {
    const maxCharsPerLine = Math.max(1, Math.floor(120 / (fontSize * 0.6)));
    const lines: string[] = [];

    for (let i = 0; i < text.length; i += maxCharsPerLine) {
        lines.push(text.slice(i, i + maxCharsPerLine));
    }

    return lines;
};

const buildSvg = (
    text: string,
    color: string,
    bg: string,
    fontSize: number,
): string => {
    const safeColor = validateColor(color);
    const safeBg = bg === "transparent" ? "transparent" : validateColor(bg);
    const lines = splitLines(text, fontSize).map(escapeXml);
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (128 - totalTextHeight) / 2 + fontSize * 0.85;

    const tspans = lines
        .map(
            (line, i) =>
                `<tspan x="64" dy="${i === 0 ? 0 : lineHeight}">${line}</tspan>`,
        )
        .join("");

    const bgRect =
        safeBg === "transparent"
            ? ""
            : `<rect width="128" height="128" fill="${safeBg}"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
${bgRect}
<text x="64" y="${startY}" text-anchor="middle" font-size="${fontSize}" fill="${safeColor}" font-family="sans-serif">${tspans}</text>
</svg>`;
};

export const generateEmojiImage = async (
    options: EmojiOptions,
): Promise<Buffer> => {
    const { text, color = "white", bg = "transparent", fontSize } = options;

    if (!text) {
        throw new Error("テキストを指定してください。");
    }

    const size = fontSize ?? autoFontSize(text);
    const svg = buildSvg(text, color, bg, size);

    const buffer = await sharp(Buffer.from(svg))
        .resize(128, 128)
        .png()
        .toBuffer();

    return buffer;
};

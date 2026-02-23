import { resolve } from "node:path";
import sharp from "sharp";

const FONT_FILE = resolve(
    import.meta.dir,
    "../fonts/rounded-x-mplus-1p-bold.ttf",
);

export interface EmojiOptions {
    text: string;
    color?: string | undefined;
    bg?: string | undefined;
    fontSize?: number | undefined;
}

const escapeXml = (str: string): string =>
    str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const MAX_CHARS_PER_LINE = 3;

const splitText = (text: string): string[] => {
    const chars = [...text];
    const len = chars.length;
    if (len <= MAX_CHARS_PER_LINE) return [chars.join("")];

    const numLines = Math.ceil(len / MAX_CHARS_PER_LINE);
    const base = Math.floor(len / numLines);
    const remainder = len % numLines;

    const lines: string[] = [];
    let offset = 0;
    for (let i = 0; i < numLines; i++) {
        const lineLen = base + (i < remainder ? 1 : 0);
        lines.push(chars.slice(offset, offset + lineLen).join(""));
        offset += lineLen;
    }
    return lines;
};

const autoFontSize = (lines: string[]): number => {
    const maxChars = Math.max(...lines.map((l) => [...l].length));
    const numLines = lines.length;
    if (maxChars <= 1) return 96;
    if (numLines <= 1) return maxChars <= 2 ? 64 : 48;
    if (numLines <= 2) return maxChars <= 2 ? 56 : 40;
    if (numLines <= 3) return maxChars <= 2 ? 40 : 32;
    return 24;
};

const VALID_COLOR_PATTERN = /^[a-zA-Z0-9#(),.\s]+$/;

const validateColor = (value: string): void => {
    if (!VALID_COLOR_PATTERN.test(value)) {
        throw new Error("無効な色指定です");
    }
};

const DEFAULT_COLORS = [
    "orange",
    "red",
    "powderblue",
    "blue",
    "indigo",
    "violet",
    "purple",
    "cyan",
    "pink",
    "olive",
    "darkgreen",
    "limegreen",
    "gold",
    "tan",
    "chocolate",
    "turquoise",
] as const;

const randomColor = (): string =>
    DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)] ??
    "orange";

export const generateEmojiImage = async (
    options: EmojiOptions,
): Promise<Buffer> => {
    const { text, color = randomColor(), bg, fontSize } = options;

    if (!text) {
        throw new Error("テキストを指定してください。");
    }

    validateColor(color);
    if (bg && bg !== "transparent") {
        validateColor(bg);
    }

    const lines = splitText(text);
    const size = fontSize ?? autoFontSize(lines);
    const escapedText = lines.map(escapeXml).join("\n");
    const escapedColor = escapeXml(color);

    const pangoMarkup = `<span foreground="${escapedColor}" font="Rounded-X M+ 1p ${size}">${escapedText}</span>`;

    const rawTextImg = await sharp({
        text: {
            text: pangoMarkup,
            fontfile: FONT_FILE,
            rgba: true,
            align: "centre",
        },
    })
        .png()
        .toBuffer();

    const rawMeta = await sharp(rawTextImg).metadata();
    const rawW = rawMeta.width ?? 128;
    const rawH = rawMeta.height ?? 128;

    const scale = Math.min(1, 128 / rawW, 128 / rawH);
    const textImg =
        scale < 1
            ? await sharp(rawTextImg)
                  .resize(Math.round(rawW * scale), Math.round(rawH * scale))
                  .png()
                  .toBuffer()
            : rawTextImg;

    const meta = await sharp(textImg).metadata();
    const textWidth = meta.width ?? 128;
    const textHeight = meta.height ?? 128;

    const top = Math.max(0, Math.round((128 - textHeight) / 2));
    const left = Math.max(0, Math.round((128 - textWidth) / 2));

    let pipeline = sharp({
        create: {
            width: 128,
            height: 128,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite([{ input: textImg, top, left }]);

    if (bg && bg !== "transparent") {
        pipeline = pipeline.flatten({ background: bg });
    }

    return pipeline.png().toBuffer();
};

import { describe, expect, test } from "bun:test";
import sharp from "sharp";
import { generateEmojiImage } from "../emoji-generator";

describe("generateEmojiImage", () => {
    test("returns a valid PNG buffer", async () => {
        const buffer = await generateEmojiImage({ text: "A" });
        // PNG magic bytes: 0x89 0x50 0x4E 0x47
        expect(buffer[0]).toBe(0x89);
        expect(buffer[1]).toBe(0x50);
        expect(buffer[2]).toBe(0x4e);
        expect(buffer[3]).toBe(0x47);
    });

    test("produces a 128x128 image", async () => {
        const buffer = await generateEmojiImage({ text: "Hi" });
        const metadata = await sharp(buffer).metadata();
        expect(metadata.width).toBe(128);
        expect(metadata.height).toBe(128);
    });

    test("output is under 256 KiB", async () => {
        const buffer = await generateEmojiImage({ text: "テスト" });
        expect(buffer.byteLength).toBeLessThan(256 * 1024);
    });

    test("accepts single character", async () => {
        const buffer = await generateEmojiImage({ text: "X" });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("accepts long text", async () => {
        const buffer = await generateEmojiImage({
            text: "This is a long text string",
        });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("accepts unicode characters", async () => {
        const buffer = await generateEmojiImage({ text: "日本語" });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("accepts emoji characters", async () => {
        const buffer = await generateEmojiImage({ text: "🎉" });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("applies custom color option", async () => {
        const buffer = await generateEmojiImage({
            text: "A",
            color: "red",
        });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("applies custom hex color", async () => {
        const buffer = await generateEmojiImage({
            text: "A",
            color: "#ff0000",
        });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("applies background color", async () => {
        const buffer = await generateEmojiImage({
            text: "A",
            bg: "blue",
        });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("applies custom font size", async () => {
        const buffer = await generateEmojiImage({
            text: "A",
            fontSize: 96,
        });
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test("prevents SVG injection via text", async () => {
        const buffer = await generateEmojiImage({
            text: '<script>alert("xss")</script>',
        });
        // Should produce a valid image without executing script
        expect(buffer[0]).toBe(0x89);
        expect(buffer[1]).toBe(0x50);
    });

    test("prevents SVG injection via color", async () => {
        await expect(
            generateEmojiImage({
                text: "A",
                color: '"><script>alert(1)</script>',
            }),
        ).rejects.toThrow("無効な色指定です");
    });

    test("prevents SVG injection via bg", async () => {
        await expect(
            generateEmojiImage({
                text: "A",
                bg: 'blue" onload="alert(1)',
            }),
        ).rejects.toThrow("無効な色指定です");
    });

    test("throws on empty text", async () => {
        await expect(generateEmojiImage({ text: "" })).rejects.toThrow(
            "テキストを指定してください",
        );
    });

    test("uses transparent background by default", async () => {
        const buffer = await generateEmojiImage({ text: "A" });
        const metadata = await sharp(buffer).metadata();
        expect(metadata.channels).toBe(4); // RGBA = has alpha channel
    });
});

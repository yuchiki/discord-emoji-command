# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

discord-emoji-command is a Discord bot that provides a `/emoji` slash command for generating custom emoji images from text and registering them as server emoji. Written in TypeScript using Discord.js v14 and Sharp for image generation. Runs on the Bun runtime.

## Build & Run Commands

- `bun install` — install dependencies
- `bun run start` — run the bot (`bun run src/index.ts`)
- `bun run format` — format code with Biome (`biome format --write src/`)
- `bun run lint` — lint code with Biome (`biome lint src/`)
- `bun run check` — format + lint in one pass with Biome (`biome check --write src/`)
- `bun run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `bun test` — run all unit tests with Bun's built-in test runner

Biome is used for formatting and linting.

## Architecture

- **`src/index.ts`** — Discord bot entry point (client setup, command registration, event handlers)
  - **`registerCommands(clientId, token)`** — registers the `/emoji` slash command via Discord REST API
  - **`emoji_command(interaction)`** — extracts text, name, color, bg, and font-size options, validates emoji name, calls `generateEmojiImage()`, then registers the emoji via `guild.emojis.create()`
  - **`main()`** — reads env vars, registers commands, creates Discord client, starts the bot. Guarded by `import.meta.main`.
- **`src/emoji-generator.ts`** — emoji image generation module
  - **`generateEmojiImage(options)`** — builds an SVG with the given text/color/bg/fontSize, converts to 128x128 PNG via Sharp. Includes auto font sizing heuristic, multi-line text splitting, XML escaping, and color validation to prevent SVG injection.
- **`src/__tests__/`** — tests using Bun's built-in test runner (`bun:test`)

## Environment

- Requires Bun runtime
- `.env` is auto-loaded by Bun (no dotenv needed): `DISCORD_CLIENT_ID`, `DISCORD_TOKEN`
- Deployment options: Kubernetes (`manifests/emoji-command.yaml`), Docker (`Dockerfile`), or direct Bun

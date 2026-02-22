import {
    type CacheType,
    type ChatInputCommandInteraction,
    Client,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";
import { search_wikipedia } from "./wikipedia";

const registerCommands = async (clientId: string, token: string) => {
    const commands = [
        new SlashCommandBuilder()
            .setName("wikipedia")
            .setDescription("Search Article from Wikipedia")
            .addStringOption((option) =>
                option
                    .setName("word")
                    .setDescription("検索語")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("languages")
                    .setDescription(
                        "言語('en', 'ja', 'fr', 'en,ja,fr' など。デフォルトはja)",
                    ),
            ),
    ].map((command) => command.toJSON());

    const rest = new REST({ version: "10" }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("コマンド登録完了");
};

const main = async () => {
    const clientId = process.env["WIKIPEDIAN_CLIENT_ID"];
    const token = process.env["WIKIPEDIAN_TOKEN"];
    const wikipediaProtocol = process.env["WIKIPEDIA_PROTOCOL"] ?? "https";
    const wikipediaHost = process.env["WIKIPEDIA_HOST"] ?? "wikipedia.org";

    if (!clientId || !token) {
        console.error("WIKIPEDIAN_CLIENT_ID and WIKIPEDIAN_TOKEN must be set");
        process.exit(1);
    }

    try {
        await registerCommands(clientId, token);
    } catch (e) {
        console.error("コマンド登録失敗:", e);
    }

    const client = new Client({ intents: [] });

    client.once("ready", () => {
        console.log("起動完了");
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === "wikipedia" && interaction.isChatInputCommand()) {
            try {
                await wikipedia_command(
                    interaction,
                    wikipediaProtocol,
                    wikipediaHost,
                );
            } catch (error) {
                console.error("wikipedia_command failed:", error);
                try {
                    const errorMessage =
                        "エラーが発生しました。もう一度お試しください。";
                    if (interaction.deferred || interaction.replied) {
                        await interaction.followUp({
                            content: errorMessage,
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: errorMessage,
                            ephemeral: true,
                        });
                    }
                } catch (replyError) {
                    console.error("Failed to send error response:", replyError);
                }
            }
        }
    });

    client.login(token);
};

const wikipedia_command = async (
    interaction: ChatInputCommandInteraction<CacheType>,
    protocol: string,
    host: string,
) => {
    const raw_word = interaction.options.get("word")?.value?.toString();
    const languages = (
        interaction.options.get("languages")?.value?.toString() ?? "ja"
    ).split(",");

    if (!raw_word) {
        interaction.reply("words cannot be parsed.");
        return;
    }

    interaction.reply(
        (
            await Promise.all(
                languages.map((language: string) =>
                    search_wikipedia(language, raw_word, protocol, host),
                ),
            )
        ).join("\n"),
    );
};

if (import.meta.main) {
    main();
}

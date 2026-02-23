import {
    type CacheType,
    type ChatInputCommandInteraction,
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";

const registerCommands = async (clientId: string, token: string) => {
    const commands = [
        new SlashCommandBuilder()
            .setName("emoji")
            .setDescription(
                "テキストから絵文字画像を生成してサーバーに登録する",
            )
            .addStringOption((option) =>
                option
                    .setName("text")
                    .setDescription("絵文字にするテキスト")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("name")
                    .setDescription(
                        "絵文字の名前 (英数字とアンダースコア、2〜32文字)",
                    )
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("color")
                    .setDescription(
                        "テキストの色 (例: red, #ff0000。デフォルト: ランダム)",
                    ),
            )
            .addStringOption((option) =>
                option
                    .setName("bg")
                    .setDescription(
                        "背景色 (例: blue, #0000ff。デフォルト: transparent)",
                    ),
            )
            .addIntegerOption((option) =>
                option
                    .setName("font-size")
                    .setDescription(
                        "フォントサイズ (省略時はテキスト長に応じて自動設定)",
                    )
                    .setMinValue(8)
                    .setMaxValue(128),
            ),
    ].map((command) => command.toJSON());

    const rest = new REST({ version: "10" }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("コマンド登録完了");
};

const EMOJI_NAME_PATTERN = /^[a-zA-Z0-9_]{2,32}$/;

const emoji_command = async (
    interaction: ChatInputCommandInteraction<CacheType>,
) => {
    const text = interaction.options.getString("text", true);
    const name = interaction.options.getString("name", true);
    const color = interaction.options.getString("color") ?? undefined;
    const bg = interaction.options.getString("bg") ?? "transparent";
    const fontSize = interaction.options.getInteger("font-size") ?? undefined;

    if (!EMOJI_NAME_PATTERN.test(name)) {
        await interaction.reply({
            content:
                "絵文字名は英数字とアンダースコアのみ、2〜32文字で指定してください。",
            ephemeral: true,
        });
        return;
    }

    const guild = interaction.guild;
    if (!guild) {
        await interaction.reply({
            content: "このコマンドはサーバー内でのみ使用できます。",
            ephemeral: true,
        });
        return;
    }

    await interaction.deferReply();

    try {
        const { generateEmojiImage } = await import("./emoji-generator");
        const buffer = await generateEmojiImage({ text, color, bg, fontSize });

        const emoji = await guild.emojis.create({
            attachment: buffer,
            name,
        });

        await interaction.editReply(
            `絵文字 ${emoji.toString()} (\`:${name}:\`) を登録しました！`,
        );
    } catch (error: unknown) {
        console.error("emoji_command failed:", error);

        let message = "絵文字の作成に失敗しました。";

        if (error instanceof Error) {
            if ("code" in error && (error as { code: number }).code === 30008) {
                message =
                    "サーバーの絵文字数が上限に達しています。不要な絵文字を削除してから再度お試しください。";
            } else if (
                "code" in error &&
                (error as { code: number }).code === 50013
            ) {
                message =
                    "Botに絵文字を管理する権限がありません。サーバー設定を確認してください。";
            }
        }

        await interaction.editReply(message);
    }
};

const main = async () => {
    const clientId = process.env["DISCORD_CLIENT_ID"];
    const token = process.env["DISCORD_TOKEN"];

    if (!clientId || !token) {
        console.error("DISCORD_CLIENT_ID and DISCORD_TOKEN must be set");
        process.exit(1);
    }

    try {
        await registerCommands(clientId, token);
    } catch (e) {
        console.error("コマンド登録失敗:", e);
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once("ready", () => {
        console.log("起動完了");
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === "emoji" && interaction.isChatInputCommand()) {
            try {
                await emoji_command(interaction);
            } catch (error) {
                console.error("emoji_command failed:", error);
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

if (import.meta.main) {
    main();
}

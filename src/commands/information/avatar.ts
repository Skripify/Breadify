import { Command } from "../../interfaces/Command";
import {
  APIApplicationCommandOptionChoice,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { colors } from "../../config";

const types: APIApplicationCommandOptionChoice<string>[] = [
  {
    name: "Global",
    value: "global",
  },
  {
    name: "Server",
    value: "server",
  },
];

type AvatarType = "global" | "server";

export default {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View a member's avatar.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to view the avatar of.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of avatar to view.")
        .setChoices(...types)
        .setRequired(false)
    ),
  execute: async ({ interaction }) => {
    const member =
      interaction.options.getMember("member") || interaction.member;
    const type = (interaction.options.getString("type") ??
      "server") as AvatarType;

    if (type === "global") {
      const avatar = member.user.displayAvatarURL({ size: 4096 });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${member.user.username}'s global avatar`)
            .setDescription(
              `[Click here to download](${avatar.replace("webp", "png")})`
            )
            .setImage(avatar)
            .setColor(colors.main),
        ],
      });
    } else {
      const avatar = member.displayAvatarURL({ size: 4096 });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${member.displayName}'s avatar`)
            .setDescription(
              `[Click here to download](${avatar.replace("webp", "png")})`
            )
            .setImage(avatar)
            .setColor(colors.main),
        ],
      });
    }
  },
} as Command;

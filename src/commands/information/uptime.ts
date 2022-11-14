import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("See how long the bot has been up for."),
  execute: async ({ client: { startTime }, interaction }) => {
    const uptime = Math.round(startTime / 1000);
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `<a:countdown:1041603937268146217> **Up since**:\n> <t:${uptime}:f> | <t:${uptime}:R>`
          )
          .setColor(colors.main),
      ],
      ephemeral: true,
    });
  },
} as Command;

import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fact } from "popcat.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("fact")
    .setDescription("Get a random fact!"),
  execute: async ({ interaction }) => {
    interaction.deferReply();

    const f = await fact();

    interaction.followUp({
      embeds: [new EmbedBuilder().setDescription(f).setColor(colors.main)],
    });
  },
} as Command;

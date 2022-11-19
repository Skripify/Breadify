import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fox } from "animals.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("fox")
    .setDescription("Gets a random photo of a fox."),
  execute: async ({ interaction }) => {
    await interaction.deferReply();

    interaction.followUp({
      embeds: [new EmbedBuilder().setImage(await fox()).setColor(colors.main)],
    });
  },
} as Command;

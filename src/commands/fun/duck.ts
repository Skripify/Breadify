import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { duck } from "animals.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("duck")
    .setDescription("Gets a random photo of a duck."),
  execute: async ({ interaction }) => {
    await interaction.deferReply();

    interaction.followUp({
      embeds: [new EmbedBuilder().setImage(await duck()).setColor(colors.main)],
    });
  },
} as Command;

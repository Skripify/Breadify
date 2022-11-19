import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { cat } from "animals.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("cat")
    .setDescription("Gets a random photo of a cat."),
  execute: async ({ interaction }) => {
    await interaction.deferReply();

    interaction.followUp({
      embeds: [new EmbedBuilder().setImage(await cat()).setColor(colors.main)],
    });
  },
} as Command;

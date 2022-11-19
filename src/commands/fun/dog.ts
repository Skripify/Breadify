import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { dog } from "animals.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("dog")
    .setDescription("Gets a random photo of a dog."),
  execute: async ({ interaction }) => {
    await interaction.deferReply();

    interaction.followUp({
      embeds: [new EmbedBuilder().setImage(await dog()).setColor(colors.main)],
    });
  },
} as Command;

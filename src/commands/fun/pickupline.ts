import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { pickupLine } from "popcat.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("pickupline")
    .setDescription("Get some pickup lines to try."),
  execute: async ({ interaction }) => {
    interaction.deferReply();

    const line = await pickupLine();

    interaction.followUp({
      embeds: [new EmbedBuilder().setDescription(line).setColor(colors.main)],
    });
  },
} as Command;

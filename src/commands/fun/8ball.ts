import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { eightBall } from "popcat.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question!")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question you want to ask to the 8-ball.")
        .setRequired(true)
    ),
  execute: async ({ interaction }) => {
    interaction.deferReply();

    const question = interaction.options.getString("question");
    const answer = await eightBall();

    interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**${interaction.member.displayName} asked**: ${question}\n**8-Ball answered**: ${answer}`
          )
          .setColor(colors.main),
      ],
    });
  },
} as Command;

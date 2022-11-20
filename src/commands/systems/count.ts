import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("count")
    .setDescription("Get the current count."),
  execute: async ({ client, interaction }) => {
    if (
      client.db.get(interaction.guild.id, "counting.channel") === null ||
      client.db.get(interaction.guild.id, "counting.count") === null
    )
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("The counting system isn't enabled in this server.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `The current count is **${client.db.get(
              interaction.guild.id,
              "counting.count"
            )}**.`
          )
          .setColor(colors.main),
      ],
      ephemeral: true,
    });
  },
} as Command;

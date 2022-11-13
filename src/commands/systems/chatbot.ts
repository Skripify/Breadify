import { Command } from "../../interfaces/Command";
import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("chatbot")
    .setDescription("Everything related to the chatbot system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable the chatbot system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the chatbot channel.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable the chatbot system.")
    ),
  execute: async ({ client, interaction }) => {
    client.db.ensure(interaction.guild.id, {
      chatbot: null,
    });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "enable") {
      const channel = interaction.options.getChannel("channel");

      client.db.set(interaction.guild.id, channel.id, "chatbot");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("The chatbot system has successfully been enabled!")
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    } else if (subcommand === "disable") {
      client.db.set(interaction.guild.id, null, "chatbot");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "The chatbot system has successfully been disabled!"
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    }
  },
} as Command;

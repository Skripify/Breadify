import { Command } from "../../interfaces/Command";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { prisma } from "../../utils/db";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Everything related to the suggestions system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Setup the suggestions system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the suggestion channel.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("threads")
            .setDescription(
              "Should we automatically create a thread for the suggestion?"
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update")
        .setDescription("Update the settings in the suggestion system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the suggestion channel.")
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("threads")
            .setDescription(
              "Should we automatically create a thread for the suggestion?"
            )
            .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "setup") {
      const channel = interaction.options.getChannel("channel");
      const threads = interaction.options.getBoolean("threads") ?? false;

      await prisma.guild.upsert({
        where: {
          id: interaction.guild.id,
        },
        create: {
          id: interaction.guild.id,
          suggestions_channel: channel.id,
          suggestion_threads: threads,
        },
        update: {
          suggestions_channel: channel.id,
          suggestion_threads: threads,
        },
      });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "The suggestion system has successfully been setup!"
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    }
  },
} as Command;

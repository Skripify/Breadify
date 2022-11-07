import { Command } from "../../interfaces/Command";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Everything related to the AFk system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set yourself as AFK.")
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("The reason why you're going AFK.")
        )
    ),
  execute: async ({ client, interaction }) => {
    client.db.ensure(interaction.user.id, {
      afk: {
        is_afk: false,
        reason: null,
        timestamp: null,
      },
    });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const reason =
        interaction.options.getString("reason") ?? "No reason specified.";

      client.db.set(interaction.user.id, true, "afk.is_afk");
      client.db.set(interaction.user.id, reason, "afk.reason");
      client.db.set(interaction.user.id, Date.now(), "afk.timestamp");

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`You are now AFK!\n> **Reason**: ${reason}`)
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    }
  },
} as Command;

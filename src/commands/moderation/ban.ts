import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to ban.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason why you're banning this member.")
        .setRequired(false)
    ),
  execute: async ({ interaction }) => {
    const member = interaction.options.getMember("member");
    if (!member)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("That member is no longer in the server.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (member === interaction.member)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("You can't ban yourself.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    )
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "You can't ban a member that has a higher/equal role to you."
            )
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (!member.bannable)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("I can't ban that member.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const reason =
      interaction.options.getString("reason") ?? "No reason specified.";

    member.ban({ reason });

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**${member.user.tag}** has been banned from the server!\n> **Reason**: ${reason}`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });
  },
} as Command;

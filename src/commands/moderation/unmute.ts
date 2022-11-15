import { Command } from "../../interfaces/Command";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a member from the server.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to unmute.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason why you're unmuting this member.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  execute: async ({ client, interaction }) => {
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
            .setDescription("You can't unmute yourself.")
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
              "You can't unmute a member that has a higher/equal role to you."
            )
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (!member.manageable)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("I can't unmute that member.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (!member.isCommunicationDisabled())
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("That member is already unmuted.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const reason =
      interaction.options.getString("reason") ?? "No reason specified.";

    member.timeout(null, reason);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**${member.user.tag}** has been unmuted from the server!\n> **Reason**: ${reason}`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });
  },
} as Command;

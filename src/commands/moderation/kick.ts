import { Command } from "../../interfaces/Command";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { colors } from "../../config";
import logger from "../../utils/logger";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to kick.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason why you're kicking this member.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
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
            .setDescription("You can't kick yourself.")
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
              "You can't kick a member that has a higher/equal role to you."
            )
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (!member.kickable)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("I can't kick that member.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const reason =
      interaction.options.getString("reason") ?? "No reason specified.";

    member
      .send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `You have been kicked from **${interaction.guild.name}**.\n> **Reason**: ${reason}`
            )
            .setColor(colors.fail),
        ],
      })
      .catch(() => {
        logger.error(
          `Couldn't DM ${member.user.tag} because they have their DMs off.`
        );
      });

    member.kick(reason);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**${member.user.tag}** has been kicked from the server!\n> **Reason**: ${reason}`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });
  },
} as Command;

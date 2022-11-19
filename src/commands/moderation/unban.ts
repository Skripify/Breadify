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
    .setName("unban")
    .setDescription("Unban a member from the server.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription(
          "The member to unban. You usually just type their ID here."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason why you're unbanning this member.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  execute: async ({ interaction }) => {
    const member = interaction.options.getUser("member");
    if (!member)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Invalid member ID.")
            .setColor(colors.fail),
        ],
      });

    const reason =
      interaction.options.getString("reason") ?? "No reason specified.";

    interaction.guild.members
      .unban(member.id, reason)
      .then((user) => {
        user
          .send({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `You have been unbanned from **${interaction.guild.name}**.\n> **Reason**: ${reason}`
                )
                .setColor(colors.fail),
            ],
          })
          .catch(() => {
            logger.error(
              `Couldn't DM ${user.tag} because they have their DMs off.`
            );
          });

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `**${user.tag}** has been unbanned from the server!\n> **Reason**: ${reason}`
              )
              .setColor(colors.success),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("That member isn't banned in the server.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });
      });
  },
} as Command;

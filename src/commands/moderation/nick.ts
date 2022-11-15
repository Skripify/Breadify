import { Command } from "../../interfaces/Command";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change the nickname of a member.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to change the nickname of.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("The nickname to set.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  execute: async ({ client, interaction }) => {
    const member = interaction.options.getMember("member");
    const nickname = interaction.options.getString("nickname") ?? null;

    if (!member)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("That member is no longer in the server.")
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
            .setDescription("I can't change the nickname of that member.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (nickname === null && !member.nickname)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("That member doesn't have a nickname.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const oldName = member.nickname ?? "None";

    member.setNickname(nickname);

    if (nickname === null)
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`**${member.user.tag}**'s nickname has been reset!`)
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    else
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `**${member.user.tag}**'s nickname has been changed!\n> **Original nickname**: ${oldName}\n> **New nickname**: ${nickname}`
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
  },
} as Command;

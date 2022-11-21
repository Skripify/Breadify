import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("invites")
    .setDescription("See how many people someone has invited to this server.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to view the invites of.")
        .setRequired(false)
    ),
  execute: async ({ interaction }) => {
    if (!interaction.guild.members.me.permissions.has("ManageGuild"))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("I don't have permission to view invites.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const member = interaction.options.getUser("member") || interaction.user;
    const invites = await (
      await interaction.guild.invites.fetch()
    )
      .filter(({ inviter }) => inviter && inviter.id === member.id)
      .map((inv) => inv.uses)
      .reduce((a, b) => a + b, 0);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**${member.tag}** has invited **${invites}** people.`
          )
          .setColor(colors.main),
      ],
    });
  },
} as Command;

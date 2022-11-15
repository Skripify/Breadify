import { Command } from "../../interfaces/Command";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Everything about managing roles.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a role to a member.")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("The member to add the role to.")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to remove.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription(
              "The reason why you're adding this role to this member."
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a role from a member.")
        .addUserOption((option) =>
          option
            .setName("member")
            .setDescription("The member to remove the role from.")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to remove.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription(
              "The reason why you're removing this role from this member."
            )
            .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  execute: async ({ client, interaction }) => {
    const subcommand = interaction.options.getSubcommand();
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
            .setDescription("You can't manage your own roles.")
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
              "You can't manage a member's roles that has a higher/equal role to you."
            )
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (!member.manageable)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("I can't manage that member's roles.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const role = interaction.options.getRole("role");

    if (!role)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("That role no longer exists.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (role.position >= interaction.guild.members.me.roles.highest.position)
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setDescription(
            `I can't ${subcommand === "add" ? "add" : "remove"} that role ${
              subcommand === "add" ? "to" : "from"
            } anyone because it's higher/equal to my role.`
          ),
        ],
      });

    const reason =
      interaction.options.getString("reason") ?? "No reason specified.";

    if (subcommand === "add") member.roles.add(role, reason);
    else member.roles.remove(role, reason);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${subcommand === "add" ? "Added" : "Removed"} the **${
              role.name
            }** role ${subcommand === "add" ? "to" : "from"} **${
              member.user.tag
            }**!`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });
  },
} as Command;

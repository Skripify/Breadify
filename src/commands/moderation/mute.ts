import { Command } from "../../interfaces/Command";
import ms from "ms";
import {
  APIApplicationCommandOptionChoice,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { colors } from "../../config";

const times: APIApplicationCommandOptionChoice<number>[] = [
  {
    name: "60 seconds",
    value: ms("60s"),
  },
  {
    name: "5 minutes",
    value: ms("5m"),
  },
  {
    name: "10 minutes",
    value: ms("10m"),
  },
  {
    name: "1 hour",
    value: ms("1h"),
  },
  {
    name: "1 day",
    value: ms("1d"),
  },
  {
    name: "1 week",
    value: ms("7d"),
  },
];

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member from the server.")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("The member to mute.")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("time")
        .setDescription("The amount of time to mute this member for.")
        .setChoices(...times)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason why you're muting this member.")
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
            .setDescription("You can't mute yourself.")
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
              "You can't mute a member that has a higher/equal role to you."
            )
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    if (!member.manageable)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("I can't mute that member.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    const time = interaction.options.getNumber("time");

    const reason =
      interaction.options.getString("reason") ?? "No reason specified.";

    member.timeout(time, reason);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**${
              member.user.tag
            }** has been muted from the server!\n> **Time:** ${ms(time, {
              long: true,
            })}\n> **Reason**: ${reason}`
          )
          .setColor(colors.success),
      ],
      ephemeral: true,
    });
  },
} as Command;

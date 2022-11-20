import { Command } from "../../interfaces/Command";
import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextBasedChannel,
} from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("counting")
    .setDescription("Everything related to the counting system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable the counting system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the counting channel.")
            .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread)
            .setRequired(false)
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName("update")
        .setDescription("Update the counting system.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("channel")
            .setDescription("Update the counting channel.")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("The channel to set as the counting channel.")
                .addChannelTypes(
                  ChannelType.GuildText,
                  ChannelType.PublicThread
                )
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("count")
            .setDescription("Update the count.")
            .addNumberOption((option) =>
              option
                .setName("count")
                .setDescription("The new count.")
                .setRequired(true)
            )
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async ({ client, interaction }) => {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    client.db.ensure(interaction.guild.id, {
      counting: {
        channel: null,
        count: null,
        previous_counter: null,
      },
    });

    if (subcommand === "enable") {
      let channel = interaction.options.getChannel(
        "channel"
      ) as TextBasedChannel;
      if (!channel)
        channel = await interaction.guild.channels.create({
          name: "counting",
          type: ChannelType.GuildText,
        });

      client.db.set(interaction.guild.id, channel.id, "counting.channel");
      client.db.set(interaction.guild.id, 0, "counting.count");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Counting system has successfully been enabled in ${channel}!`
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    } else if (group === "update") {
      switch (subcommand) {
        case "channel":
          {
            const channel = interaction.options.getChannel("channel");
            if (!channel)
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription("That channel no longer exists.")
                    .setColor(colors.fail),
                ],
                ephemeral: true,
              });

            const data = client.db.get(interaction.guild.id, "counting");

            if (data.channel === channel.id)
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      "That channel is already set as the counting channel."
                    )
                    .setColor(colors.fail),
                ],
                ephemeral: true,
              });

            client.db.set(interaction.guild.id, channel.id, "counting.channel");

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `Counting channel has successfully been set to ${channel}!`
                  )
                  .setColor(colors.success),
              ],
              ephemeral: true,
            });
          }
          break;
        case "count":
          {
            const oldCount = client.db.get(
              interaction.guild.id,
              "counting.count"
            );
            const newCount = interaction.options.getNumber("count");

            if (oldCount === newCount)
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      "The new count is the same as the current count."
                    )
                    .setColor(colors.fail),
                ],
                ephemeral: true,
              });

            client.db.set(interaction.guild.id, newCount, "counting.count");

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `Count has successfully been set to **${newCount}**!`
                  )
                  .setColor(colors.success),
              ],
              ephemeral: true,
            });
          }
          break;
        default:
          break;
      }
    }
  },
} as Command;

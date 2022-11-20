import { Command } from "../../interfaces/Command";
import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { colors } from "../../config";
import { replaceVars } from "../../utils/functions";

export default {
  data: new SlashCommandBuilder()
    .setName("leaver")
    .setDescription("Everything related to the leaver system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable the leaver system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the leave channel.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to sent in the leave channel.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("preview").setDescription("Preview the leave message.")
    )
    .addSubcommandGroup((group) =>
      group
        .setName("update")
        .setDescription("Update the leaver system.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("channel")
            .setDescription("Update the leave channel.")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("The channel to set as the leave channel.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("message")
            .setDescription("Update the leave message.")
            .addStringOption((option) =>
              option
                .setName("message")
                .setDescription("The message to send in the leave channel.")
                .setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("disable").setDescription("Disable the leaver system.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async ({ client, interaction }) => {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    client.db.ensure(interaction.guild.id, {
      leaver: {
        channel: null,
        message: null,
      },
    });

    if (subcommand === "enable") {
      const channel = interaction.options.getChannel("channel");
      const message = interaction.options.getString("message");

      client.db.set(interaction.guild.id, channel.id, "leaver.channel");
      client.db.set(interaction.guild.id, message, "leaver.message");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("The leaver system has successfully been enabled!")
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    } else if (group === "update") {
      const data = client.db.get(interaction.guild.id, "welcomer");

      if (data.channel === null)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `The welcomer system isn't enabled.\nTry using </welcomer enable:${
                  interaction.guild.commands.cache.find(
                    (x) =>
                      x.applicationId === client.user.id &&
                      x.name === "welcomer"
                  ).id
                }> instead.`
              )
              .setColor(colors.fail),
          ],
        });

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

            if (data.channel === channel.id)
              return interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      "That channel is already set as the leaver channel."
                    )
                    .setColor(colors.fail),
                ],
                ephemeral: true,
              });

            client.db.set(interaction.guild.id, channel.id, "leaver.channel");

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `Leave channel has successfully been set to ${channel}!`
                  )
                  .setColor(colors.success),
              ],
              ephemeral: true,
            });
          }
          break;
        case "message":
          {
            const message = interaction.options.getString("message");

            client.db.set(interaction.guild.id, message, "leaver.message");

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `The leave message has successfully been updated!\nPreview it by running </leaver preview:${
                      interaction.guild.commands.cache.find(
                        (x) =>
                          x.applicationId === client.user.id &&
                          x.name === "leaver"
                      ).id
                    }>.`
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
    } else if (subcommand === "preview") {
      const data = client.db.get(interaction.guild.id, "leaver");

      if (data.channel === null)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `The leaver system isn't enabled.\nTry using </leaver enable:${
                  interaction.guild.commands.cache.find(
                    (x) =>
                      x.applicationId === client.user.id && x.name === "leaver"
                  ).id
                }> instead.`
              )
              .setColor(colors.fail),
          ],
        });

      interaction.reply({
        content: replaceVars(data.message, interaction.user, interaction.guild),
        ephemeral: true,
      });
    } else if (subcommand === "disable") {
      const data = client.db.get(interaction.guild.id, "leaver");

      if (data.channel === null)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `The welcomer system isn't enabled.\nTry using </leaver enable:${
                  interaction.guild.commands.cache.find(
                    (x) =>
                      x.applicationId === client.user.id && x.name === "leaver"
                  ).id
                }> instead.`
              )
              .setColor(colors.fail),
          ],
        });

      client.db.set(interaction.guild.id, null, "leaver.channel");
      client.db.set(interaction.guild.id, null, "leaver.message");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("The leaver system has successfully been disabled!")
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    }
  },
} as Command;

import { Command } from "../../interfaces/Command";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { colors } from "../../config";
import { Interaction } from "../../types/Interaction";
import { Status } from "../../features/suggestions";
import { StatusMessage } from "../../interfaces/StatusMessages";
import { Bot } from "../../structures/Client";

export default {
  data: new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Everything related to the suggestions system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable the suggestions system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the suggestion channel.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addBooleanOption((option) =>
          option
            .setName("threads")
            .setDescription(
              "Should we automatically create a thread for the suggestion?"
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable the suggestions system.")
    )
    .addSubcommandGroup((group) =>
      group
        .setName("update")
        .setDescription("Update the suggestions system.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("channel")
            .setDescription("Update the suggestions channel.")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription(
                  "The channel to set as the suggestions channel."
                )
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("threads")
            .setDescription("Enable or disable thread creation.")
            .addBooleanOption((option) =>
              option
                .setName("enabled")
                .setDescription(
                  "Should we automatically create a thread for the suggestion?"
                )
                .setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accept")
        .setDescription("Accept a suggestion.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The suggestion to accept.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("deny")
        .setDescription("Deny a suggestion.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The suggestion to deny.")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  execute: async ({ client, interaction }) => {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    client.db.ensure(interaction.guild.id, {
      suggestion: {
        channel: null,
        threads: false,
      },
    });

    if (subcommand === "enable") {
      const channel = interaction.options.getChannel("channel");
      const threads = interaction.options.getBoolean("threads") ?? false;

      if (client.db.get(interaction.guild.id, "suggestions.channel") !== null)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `The suggestions system is already enabled.\nTry using </suggestions update:${
                  interaction.guild.commands.cache.find(
                    (x) =>
                      x.applicationId === client.user.id &&
                      x.name === "suggestions"
                  ).id
                }> instead.`
              )
              .setColor(colors.fail),
          ],
        });

      client.db.set(interaction.guild.id, channel.id, "suggestions.channel");
      client.db.set(interaction.guild.id, threads, "suggestions.threads");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "The suggestion system has successfully been enabled!"
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    } else if (subcommand === "disable") {
      if (client.db.get(interaction.guild.id, "suggestions.channel") === null)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `The suggestions system isn't enabled.\nTry using </suggestions enable:${
                  interaction.guild.commands.cache.find(
                    (x) =>
                      x.applicationId === client.user.id &&
                      x.name === "suggestions"
                  ).id
                }> instead.`
              )
              .setColor(colors.fail),
          ],
        });

      client.db.set(interaction.guild.id, null, "suggestions.channel");
      client.db.set(interaction.guild.id, false, "suggestions.threads");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "The suggestions system has successfully been disabled!"
            )
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
                `The suggestions system isn't enabled.\nTry using </suggestions enable:${
                  interaction.guild.commands.cache.find(
                    (x) =>
                      x.applicationId === client.user.id &&
                      x.name === "suggestions"
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
                      "That channel is already set as the suggestions channel."
                    )
                    .setColor(colors.fail),
                ],
                ephemeral: true,
              });

            client.db.set(
              interaction.guild.id,
              channel.id,
              "suggestions.channel"
            );

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `Suggestions channel has successfully been set to ${channel}!`
                  )
                  .setColor(colors.success),
              ],
              ephemeral: true,
            });
          }
          break;
        case "threads":
          {
            const enabled = interaction.options.getBoolean("enabled");

            client.db.set(interaction.guild.id, enabled, "suggestions.threads");

            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `Suggestions threads have succesfully been ${
                      enabled ? "enabled" : "disabled"
                    }!`
                  )
                  .setColor(colors.success),
              ],
              ephemeral: true,
            });
          }
          break;
      }
    } else if (subcommand === "accept")
      setStatus(client, interaction, Status.ACCEPTED);
    else if (subcommand === "deny")
      setStatus(client, interaction, Status.DENIED);
  },
} as Command;

async function setStatus(
  client: Bot,
  interaction: Interaction,
  status: StatusMessage
) {
  const channel = client.db.get(interaction.guild.id, "suggestions.channel");

  if (!channel)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("The suggestion system isn't set up.")
          .setColor(colors.fail),
      ],
    });

  const textChannel = interaction.guild.channels.cache.get(
    channel
  ) as TextChannel;

  if (!textChannel)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("The suggestions channel was deleted.")
          .setColor(colors.fail),
      ],
    });

  const msg = await interaction.options.getString("message_id");
  const targetMsg = await textChannel.messages.fetch(msg);

  if (!targetMsg)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "The message ID specified is invalid or the message was deleted by someone."
          )
          .setColor(colors.fail),
      ],
    });

  const oldEmbed = targetMsg.embeds[0];

  const embed = new EmbedBuilder()
    .setAuthor({
      name: oldEmbed.author.name,
      iconURL: oldEmbed.author.iconURL,
    })
    .setDescription(oldEmbed.description)
    .setFields({
      name: "Status",
      value: status.text,
    })
    .setColor(status.color);

  targetMsg.edit({ embeds: [embed], components: [] });

  if (!targetMsg.thread.archived) targetMsg.thread.setArchived(true);

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription("Suggestion has successfully been updated!")
        .setColor(colors.success),
    ],
    ephemeral: true,
  });
}

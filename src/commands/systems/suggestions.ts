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
        .setName("setup")
        .setDescription("Setup the suggestions system.")
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
        .setName("update")
        .setDescription("Update the settings in the suggestion system.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set as the suggestion channel.")
            .setRequired(false)
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
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async ({ client, interaction }) => {
    client.db.ensure(interaction.guild.id, {
      suggestion: {
        channel: null,
        threads: false,
      },
    });

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "setup") {
      const channel = interaction.options.getChannel("channel");
      const threads = interaction.options.getBoolean("threads") ?? false;

      client.db.set(interaction.guild.id, channel.id, "suggestions.channel");
      client.db.set(interaction.guild.id, threads, "suggestions.threads");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "The suggestion system has successfully been setup!"
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    } else if (subcommand === "update") {
      const channel = interaction.options.getChannel("channel");
      const threads = interaction.options.getBoolean("threads");

      if (channel)
        client.db.set(interaction.guild.id, channel.id, "suggestions.channel");
      if (threads)
        client.db.set(interaction.guild.id, threads, "suggestions.threads");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "The suggestion system has successfully been updated!"
            )
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
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

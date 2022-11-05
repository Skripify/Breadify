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
        .setName("accept")
        .setDescription("Accept a suggestion.")
        .addStringOption((option) =>
          option
            .setName("suggestion")
            .setDescription("The suggestion to accept.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("deny")
        .setDescription("Deny a suggestion.")
        .addStringOption((option) =>
          option
            .setName("suggestion")
            .setDescription("The suggestion to deny.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  autocomplete: async ({ client, interaction }) => {
    client.db.ensure(interaction.guild.id, {
      suggestions: {
        channel: null,
        threads: false,
      },
    });

    const data = client.db.get(interaction.guild.id, "suggestions");

    const channel: TextChannel | undefined =
      (await interaction.guild.channels.cache.get(data.channel)) as TextChannel;

    if (!channel) return;

    const focusedValue = interaction.options.getFocused();
    const choices = await channel.messages.fetch();

    const filtered = await Promise.all(
      choices
        .filter((msg) => msg.id.startsWith(focusedValue))
        .map(async ({ id }) => ({
          id,
          message: await channel.messages
            .fetch(id)
            .then((msg) => msg.embeds[0].description)
            .catch(() => "???"),
        }))
    );

    await interaction.respond(
      filtered.map(({ id, message }) => ({
        name: `${message} (${id})`,
        value: id,
      }))
    );
  },
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
    } else if (subcommand === "accept") setStatus(interaction, Status.ACCEPTED);
    else if (subcommand === "deny") setStatus(interaction, Status.DENIED);
  },
} as Command;

async function setStatus(interaction: Interaction, status: StatusMessage) {
  const msg = await interaction.options.getString("suggestion");

  const targetMsg = await interaction.channel.messages.fetch(msg);

  if (!targetMsg)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("That suggestion was deleted by a moderator.")
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

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription("Suggestion has successfully been updated!")
        .setColor(colors.success),
    ],
    ephemeral: true,
  });
}

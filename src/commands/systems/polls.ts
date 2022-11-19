import { Command } from "../../interfaces/Command";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder,
  TextBasedChannel,
} from "discord.js";
import { colors } from "../../config";
import { YesAndNoButtons } from "../../utils/YesAndNoButtons";

export default {
  data: new SlashCommandBuilder()
    .setName("polls")
    .setDescription("Everything related to the polls system.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a poll.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of the poll.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("The description of the poll.")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to create the poll in.")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum,
              ChannelType.PublicThread,
              ChannelType.PrivateThread
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("End a poll.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The poll to end.")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel the poll was created in.")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum,
              ChannelType.PublicThread,
              ChannelType.PrivateThread
            )
            .setRequired(false)
        )
    ),
  execute: async ({ client, interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const name = interaction.options.getString("name");
      const description = interaction.options.getString("description");
      const channel = (interaction.options.getChannel("channel") ||
        interaction.channel) as TextBasedChannel;

      if (!channel)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("That channel no longer exists.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTitle(name)
        .setDescription(description)
        .setColor(colors.main);

      channel
        .send({
          embeds: [embed],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              YesAndNoButtons
            ),
          ],
        })
        .then((msg) => {
          client.db.set(msg.id, {
            poll: {
              is_poll: true,
              starter: interaction.user.id,
            },
            upvotes: 0,
            downvotes: 0,
            users: {
              upvoted: [],
              downvoted: [],
            },
          });

          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`Poll has been created successfully!`)
                .setColor(colors.success),
            ],
            components: [
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel("View the poll")
                  .setStyle(ButtonStyle.Link)
                  .setURL(
                    `https://discord.com/channels/${interaction.guild.id}/${channel.id}/${msg.id}`
                  )
              ),
            ],
            ephemeral: true,
          });
        });
    } else if (subcommand === "end") {
      const channel = (interaction.options.getChannel("channel") ||
        interaction.channel) as TextBasedChannel;

      if (!channel)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("That channel no longer exists.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });

      const msg = interaction.options.getString("message_id");
      const targetMsg = await channel.messages.fetch(msg);

      if (!targetMsg)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "The message ID specified is invalid or the message was deleted by someone."
              )
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });

      const isPoll = client.db.get(targetMsg.id, "poll.is_poll");
      if (!isPoll)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("That is a suggestion, not a poll.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });

      const poll = client.db.get(targetMsg.id);

      if (poll.poll.starter !== interaction.user.id)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("You did not start that poll.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });

      const same = poll.upvotes === poll.downvotes;
      const won = poll.upvotes > poll.downvotes;

      const oldEmbed = targetMsg.embeds[0];

      const embed = new EmbedBuilder(oldEmbed.toJSON()).addFields({
        name: "Votes",
        value: same
          ? `Yes: ${poll.upvotes} | No: ${poll.downvotes}`
          : won
          ? `Yes: **${poll.upvotes}** | No: ${poll.downvotes}`
          : `Yes: ${poll.upvotes} | No: **${poll.downvotes}**`,
      });

      targetMsg.edit({
        embeds: [embed],
        components: [],
      });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Successfully ended poll!")
            .setColor(colors.success),
        ],
        ephemeral: true,
      });
    }
  },
} as Command;

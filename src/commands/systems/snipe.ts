import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe recently deleted messages.")
    .addNumberOption((option) =>
      option
        .setName("position")
        .setDescription("The position of the message in the snipe system.")
        .setMaxValue(20)
        .setRequired(false)
    ),
  execute: async ({ client, interaction }) => {
    const position = interaction.options.getNumber("position") ?? 1;

    const snipes = client.snipes.get(interaction.channel.id);

    if (!snipes || !snipes.length || snipes.length === 0)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("There are no deleted messages in this channel.")
            .setColor(colors.fail),
        ],
      });

    const target = snipes[position - 1];

    if (!target)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("That snipe doesn't exist.")
            .setColor(colors.fail),
        ],
      });

    const { msg, image, time } = target;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: msg.author.tag,
        iconURL: msg.author.displayAvatarURL(),
      })
      .setDescription(msg.content || null)
      .setImage(image)
      .setColor(colors.main)
      .setFooter({
        text: `${position}/${snipes.length}`,
      })
      .setTimestamp(time);

    if (msg.mentions.repliedUser)
      embed.addFields({
        name: "Replied to",
        value: `<@${msg.mentions.repliedUser.id}>`,
      });

    interaction.reply({
      embeds: [embed],
    });
  },
} as Command;

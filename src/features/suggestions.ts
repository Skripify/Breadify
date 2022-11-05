import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { colors } from "../config";
import { StatusMessages } from "../interfaces/StatusMessages";
import { Feature } from "../structures/Feature";

export const Status: StatusMessages = {
  WAITING: {
    text: "📊 Waiting for community feedback, please vote!",
    color: 0xffea00,
  },
  ACCEPTED: {
    text: "✅ Accepted idea! Expect this soon.",
    color: 0x34eb5b,
  },
  DENIED: {
    text: "❌ Thank you for the feedback, but we are not interested in this idea at this time.",
    color: 0xc20808,
  },
};

const buttons = [
  new ButtonBuilder()
    .setCustomId("yes")
    .setEmoji("1038272981929046107")
    .setLabel("0")
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId("no")
    .setEmoji("1038272697500704798")
    .setLabel("0")
    .setStyle(ButtonStyle.Danger),
];

export default new Feature((client) => {
  client.on("messageCreate", async (message) => {
    client.db.ensure(message.guild.id, {
      suggestions: {
        channel: null,
        threads: false,
      },
    });

    const channel = client.db.get(message.guild.id, "suggestions.channel");
    const threads = client.db.get(message.guild.id, "suggestions.channel");

    if (channel && channel === message.channel.id && !message.author.bot) {
      const { channel, member, content } = message;

      message.delete();

      const status = Status.WAITING;

      channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: member.displayName,
                iconURL: member.displayAvatarURL(),
              })
              .setDescription(content)
              .setFields({
                name: "Status",
                value: status.text,
              })
              .setColor(status.color),
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttons),
          ],
        })
        .then((msg) => {
          client.db.set(msg.id, {
            upvotes: 0,
            downvotes: 0,
            users: {
              upvoted: [],
              downvoted: [],
            },
          });

          if (threads)
            msg.startThread({
              name: content,
            });
        });
    }
  });

  client.on("interactionCreate", async (i) => {
    if (!i.isButton()) return;
    if (!["yes", "no"].includes(i.customId)) return;

    client.db.ensure(i.message.id, {
      upvotes: 0,
      downvotes: 0,
      users: {
        upvoted: [],
        downvoted: [],
      },
    });

    let suggestion = client.db.get(i.message.id);

    if (i.customId === "yes") {
      if (suggestion.users.upvoted.includes(i.user.id)) {
        i.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("You can't vote on a suggestion more than once.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });
        return;
      }

      if (suggestion.users.downvoted.includes(i.user.id)) {
        client.db.math(i.message.id, "-", 1, "downvotes");
        client.db.remove(i.message.id, i.user.id, "users.downvoted");
      }

      client.db.math(i.message.id, "+", 1, "upvotes");
      client.db.push(i.message.id, i.user.id, "users.upvoted");
    } else if (i.customId === "no") {
      if (suggestion.users.downvoted.includes(i.user.id)) {
        i.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("You can't vote on a suggestion more than once.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });
        return;
      }

      if (suggestion.users.upvoted.includes(i.user.id)) {
        client.db.math(i.message.id, "-", 1, "upvotes");
        client.db.remove(i.message.id, i.user.id, "users.upvoted");
      }

      client.db.math(i.message.id, "+", 1, "downvotes");
      client.db.push(i.message.id, i.user.id, "users.downvoted");
    }

    suggestion = client.db.get(i.message.id);

    i.update({
      embeds: i.message.embeds,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          buttons[0].setLabel(suggestion.upvotes.toString()),
          buttons[1].setLabel(suggestion.downvotes.toString())
        ),
      ],
    });
  });
});

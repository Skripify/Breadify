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
import { prisma } from "../utils/db";

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
    const { suggestions_channel: channel, suggestion_threads: threads } =
      await prisma.guild.findFirst({
        where: {
          id: message.guild.id,
        },
        select: {
          suggestions_channel: true,
          suggestion_threads: true,
        },
      });

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
        .then(
          async (msg) =>
            await prisma.suggestion.create({
              data: {
                id: msg.id,
                guild_id: msg.guild.id,
              },
            })
        );
    }
  });

  client.on("interactionCreate", async (i) => {
    if (!i.isButton()) return;
    if (!["yes", "no"].includes(i.customId)) return;

    const suggestion = await prisma.suggestion.findFirst({
      where: {
        id: i.message.id,
      },
    });

    const user = await prisma.user.findFirst({
      where: {
        id: i.user.id,
        suggestion: {
          some: {
            id: i.message.id,
          },
        },
      },
    });

    if (!suggestion) return;

    if (user) {
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

    await prisma.user.upsert({
      where: {
        id: i.user.id,
      },
      create: {
        id: i.user.id,
        suggestion: {
          connect: { id: i.message.id },
        },
      },
      update: {
        suggestion: {
          connect: { id: i.message.id },
        },
      },
    });

    if (i.customId === "yes") suggestion.upvotes += 1;
    else if (i.customId === "no") suggestion.downvotes += 1;

    await prisma.suggestion.update({
      where: {
        id: i.message.id,
      },
      data: suggestion,
    });

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

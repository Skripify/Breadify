import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { colors } from "../config";
import { Feature } from "../structures/Feature";
import { YesAndNoButtons } from "../utils/YesAndNoButtons";

export default new Feature((client) => {
  client.on("interactionCreate", async (i) => {
    if (!i.isButton()) return;
    if (!["yes", "no"].includes(i.customId)) return;

    client.db.ensure(i.message.id, {
      poll: {
        is_poll: true,
        starter: "",
      },
      upvotes: 0,
      downvotes: 0,
      users: {
        upvoted: [],
        downvoted: [],
      },
    });

    const isPoll = client.db.get(i.message.id, "poll.is_poll");
    let poll = client.db.get(i.message.id);

    if (!isPoll) return;

    if (i.customId === "yes") {
      if (poll.users.upvoted.includes(i.user.id)) {
        i.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("You can't vote on a poll more than once.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });
        return;
      }

      if (poll.users.downvoted.includes(i.user.id)) {
        client.db.math(i.message.id, "-", 1, "downvotes");
        client.db.remove(i.message.id, i.user.id, "users.downvoted");
      }

      client.db.math(i.message.id, "+", 1, "upvotes");
      client.db.push(i.message.id, i.user.id, "users.upvoted");
    } else if (i.customId === "no") {
      if (poll.users.downvoted.includes(i.user.id)) {
        i.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("You can't vote on a poll more than once.")
              .setColor(colors.fail),
          ],
          ephemeral: true,
        });
        return;
      }

      if (poll.users.upvoted.includes(i.user.id)) {
        client.db.math(i.message.id, "-", 1, "upvotes");
        client.db.remove(i.message.id, i.user.id, "users.upvoted");
      }

      client.db.math(i.message.id, "+", 1, "downvotes");
      client.db.push(i.message.id, i.user.id, "users.downvoted");
    }

    poll = client.db.get(i.message.id);

    i.update({
      embeds: i.message.embeds,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          YesAndNoButtons[0].setLabel(poll.upvotes.toString()),
          YesAndNoButtons[1].setLabel(poll.downvotes.toString())
        ),
      ],
    }).catch(() => {});
  });
});

import { Feature } from "../structures/Feature";
import { EmbedBuilder } from "discord.js";
import moment from "moment";
import { colors } from "../config";

export default new Feature((client) => {
  client.on("messageCreate", (message) => {
    if (!message.guild || message.author.bot) return;
    const mentioned = message.mentions.members.first();

    client.db.ensure(mentioned.id, {
      afk: {
        is_afk: false,
        reason: null,
        timestamp: null,
      },
    });

    if (mentioned) {
      const data = client.db.get(mentioned.id, "afk");

      if (!data.is_afk) return console.log("?");

      const { reason, timestamp } = data;
      const timeSince = moment(timestamp).fromNow();

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: mentioned.displayName,
              iconURL: mentioned.displayAvatarURL(),
            })
            .setDescription(
              `I've been AFK since **${timeSince}**.\n> **Reason**: ${reason}`
            )
            .setColor(colors.main),
        ],
      });
    }
  });
});

import { TextChannel } from "discord.js";
import { Feature } from "../structures/Feature";
import { replaceVars } from "../utils/functions";

export default new Feature((client) => {
  client.on("guildMemberRemove", async (member) => {
    client.db.ensure(member.guild.id, {
      welcomer: {
        channel: null,
        message: null,
      },
    });

    const { channel, message } = client.db.get(member.guild.id, "leaver");
    if (!channel || channel === null || !message || message === null) return;

    const textChannel = (await member.guild.channels.cache.get(
      channel
    )) as TextChannel;
    if (
      !textChannel ||
      !textChannel.permissionsFor(member.guild.members.me).has("SendMessages")
    )
      return;

    await textChannel.send({
      content: replaceVars(message, member.user, member.guild),
    });
  });
});

import { AuditLogEvent } from "discord.js";
import { Feature } from "../structures/Feature";

export default new Feature((client) => {
  client.on("messageCreate", (message) => {
    if (!message.guild || message.author.bot) return;

    client.db.ensure(message.guild.id, {
      counting: {
        channel: null,
        count: null,
        previous_counter: null,
      },
    });

    let data = client.db.get(message.guild.id, "counting");

    if (
      !data.channel ||
      data.channel === null ||
      data.channel !== message.channel.id
    )
      return;

    if (
      message.content === data.count ||
      isNaN(parseInt(message.content)) ||
      (data.previous_counter &&
        data.previous_counter !== null &&
        data.previous_counter === message.author.id)
    ) {
      message.delete().catch(() => {});
      return;
    }

    client.db.set(message.guild.id, message.content, "counting.count");
    client.db.set(
      message.guild.id,
      message.author.id,
      "counting.previous_counter"
    );
  });

  client.on("messageDelete", async (message) => {
    if (!message.guild || message.author.bot) return;

    client.db.ensure(message.guild.id, {
      counting: {
        channel: null,
        count: null,
        previous_counter: null,
      },
    });

    let data = client.db.get(message.guild.id, "counting");

    if (
      !data.channel ||
      data.channel === null ||
      data.channel !== message.channel.id
    )
      return;

    const logs = await message.guild.fetchAuditLogs({
      type: AuditLogEvent.MessageDelete,
    });
    const entry = logs.entries.first();

    if (entry.target.id === client.user.id) return;

    message.channel.send({
      content: `${message.author}: ${message.content}`,
    });
  });
});

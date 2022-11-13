import { Feature } from "../structures/Feature";

export default new Feature((client) => {
  client.on("messageDelete", (message) => {
    if (!message.guild || message.author.bot) return;

    let snipes = client.snipes.get(message.channel.id) || [];
    if (snipes.length > 19) snipes = snipes.slice(0, 19);

    snipes.unshift({
      msg: message,
      image: message.attachments.first()?.proxyURL || null,
      time: Date.now(),
    });

    client.snipes.set(message.channel.id, snipes);
  });
});

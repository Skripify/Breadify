import { Feature } from "../structures/Feature";
import logger from "../utils/logger";

import { Chatbot } from "popcat.js";
const chatbot = new Chatbot({
  name: "Breadify",
  gender: "Male",
  owner: "TCA",
});

export default new Feature((client) => {
  client.on("messageCreate", (message) => {
    if (!message.guild || message.author.bot) return;

    client.db.ensure(message.guild.id, {
      chatbot: null,
    });

    const channel = client.db.get(message.guild.id, "chatbot");

    if (!channel || channel === null || channel !== message.channel.id) return;

    chatbot
      .chat(message.content)
      .then((content) => message.reply({ content }))
      .catch((e) => logger.error(e));
  });
});

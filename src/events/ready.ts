import { Event } from "../structures/Event";
import logger from "../utils/logger";
import dbots from "dbots";
import { config } from "../config";

export default new Event("ready", (client) => {
  logger.info(`Logged in as ${client.user?.tag}.`);

  client.startTime = Date.now();

  if (config.postStats) {
    const poster = new dbots.Poster({
      client,
      apiKeys: {
        infinitybotlist: process.env.INFINITYBOTS_TOKEN,
      },
      clientLibrary: "discord.js",
    });

    poster.startInterval();
  }
});

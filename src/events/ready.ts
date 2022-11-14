import { Event } from "../structures/Event";
import logger from "../utils/logger";

export default new Event("ready", (client) => {
  logger.info(`Logged in as ${client.user?.tag}.`);

  client.startTime = Date.now();
});

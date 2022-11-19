import { Event } from "../structures/Event";
import logger from "../utils/logger";

export default new Event("shardReady", (client, id) => {
  logger.info(`Launched shard #${id}.`);
});

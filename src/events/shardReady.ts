import { ActivityType } from "discord.js";
import { Event } from "../structures/Event";
import logger from "../utils/logger";

export default new Event("shardReady", (client, id) => {
  logger.info(`Launched shard #${id}.`);

  client.user.setActivity(`my toaster | Shard #${id}`, {
    shardId: id,
    type: ActivityType.Watching,
  });
});

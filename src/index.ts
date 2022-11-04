import "dotenv/config";

import { ActivityType } from "discord.js";
import { Bot } from "./structures/Client";

const client = new Bot({
  presence: {
    activities: [
      {
        name: "my toaster",
        type: ActivityType.Watching,
      },
    ],
  },
});

client.start();

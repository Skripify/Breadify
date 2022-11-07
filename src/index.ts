import "dotenv/config";

import { ActivityType } from "discord.js";
import { Bot } from "./structures/Client";

const client = new Bot({
  allowedMentions: {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false,
  },
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

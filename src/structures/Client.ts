import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
} from "discord.js";
import fs from "fs";
import path from "path";
import { config } from "../config";
import { Command } from "../interfaces/Command";
import { importFile } from "../utils/functions";
import logger from "../utils/logger";
import { Event } from "./Event";
import { Feature } from "./Feature";
import Enmap from "enmap";

type BotOptions = Omit<ClientOptions, "intents">;

export class Bot extends Client {
  commands: Collection<string, Command> = new Collection();

  db = new Enmap("db", {
    dataDir: "./db",
  });

  constructor(options?: BotOptions) {
    super({
      intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent",
        "GuildMembers",
        "GuildPresences",
      ],
      ...options,
    });
  }

  start() {
    if (!process.env.TOKEN)
      return logger.error("A token was not provided. Exiting...");

    this.registerCommands();
    this.registerEvents();
    this.registerFeatures("../features/");

    this.login(process.env.TOKEN).catch(() => {
      return logger.error("The token you provided is invalid.");
    });
  }

  async registerCommands() {
    const commands: ApplicationCommandDataResolvable[] = [];
    fs.readdirSync(path.join(__dirname, "../commands")).forEach(async (dir) => {
      const commandFiles = fs
        .readdirSync(path.join(__dirname, `../commands/${dir}`))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      for (const file of commandFiles) {
        const command: Command = await importFile(`../commands/${dir}/${file}`);
        if (!command.data) {
          logger.warning(
            `The command named ${file} is missing the "data" property. Skipping...`
          );
          continue;
        }
        if (!command.execute) {
          logger.warning(
            `The command named ${file} is missing the "execute" property. Skipping...`
          );
          continue;
        }

        this.commands.set(command.data.toJSON().name, {
          category: dir,
          ...command,
        });
        commands.push(command.data.toJSON());
      }
    });

    this.on("ready", async () => {
      const { deploySlashGlobally, guildId } = config;

      if (!deploySlashGlobally && guildId) {
        const guild = this.guilds.cache.get(guildId);
        await guild?.commands.set(commands);
        logger.success(
          `Registered ${commands.length} commands in ${guild?.name}.`
        );
      } else {
        await this.application?.commands.set(commands);
        logger.info(`Registered ${commands.length} commands globally.`);
      }
    });
  }

  async registerEvents() {
    const eventFiles = fs
      .readdirSync(path.join(__dirname, "../events"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
      const event: Event<keyof ClientEvents> = await importFile(
        `../events/${file}`
      );
      if (!event.name) {
        logger.warning(
          `The event named ${file} is missing the "name" property. Skipping...`
        );
        continue;
      }
      if (!event.execute) {
        logger.warning(
          `The event named ${file} is missing the "execute" property. Skipping...`
        );
        continue;
      }

      this.on(event.name, event.execute.bind(null, this));
    }

    logger.success(`Loaded ${eventFiles.length} events.`);
  }

  async registerFeatures(dir: string) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));

      if (stat.isDirectory()) this.registerFeatures(path.join(dir, file));
      else {
        const feature: Feature = await importFile(
          path.join(__dirname, dir, file)
        );
        feature.run(this);
      }
    }
  }
}

import { ClientEvents } from "discord.js";
import { Bot } from "./Client";

export class Event<Key extends keyof ClientEvents> {
  constructor(
    public name: Key,
    public execute: (client: Bot, ...args: ClientEvents[Key]) => any
  ) {}
}

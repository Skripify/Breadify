import { Message, PartialMessage } from "discord.js";

export interface Snipe {
  msg: Message | PartialMessage;
  image?: string;
  time: number;
}

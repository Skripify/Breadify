import { ColorResolvable, EmojiResolvable } from "discord.js";

export interface Config {
  deploySlashGlobally: boolean;
  guildId: string;
}

export interface Colors {
  main: ColorResolvable;
  success: ColorResolvable;
  fail: ColorResolvable;
}

export interface Emotes {
  previous: EmojiResolvable;
  next: EmojiResolvable;
  yes: EmojiResolvable;
  no: EmojiResolvable;
  logo: EmojiResolvable;
  discord: EmojiResolvable;
}

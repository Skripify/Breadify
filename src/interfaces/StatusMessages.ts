import { ColorResolvable } from "discord.js";

export interface StatusMessage {
  text: string;
  color: ColorResolvable;
}

export interface StatusMessages {
  WAITING: StatusMessage;
  ACCEPTED: StatusMessage;
  DENIED: StatusMessage;
}

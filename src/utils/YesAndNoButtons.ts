import { ButtonBuilder, ButtonStyle } from "discord.js";
import { emotes } from "../config";

export const YesAndNoButtons = [
  new ButtonBuilder()
    .setCustomId("yes")
    .setEmoji(emotes.yes)
    .setLabel("0")
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId("no")
    .setEmoji(emotes.no)
    .setLabel("0")
    .setStyle(ButtonStyle.Danger),
];

import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { emotes } from "../config";

export async function importFile(path: string) {
  return (await import(path))?.default;
}

export function getRow(cur: number, embeds: EmbedBuilder[]) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setStyle(2)
        .setEmoji(emotes.previous)
        .setDisabled(cur === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setStyle(2)
        .setEmoji(emotes.next)
        .setDisabled(cur === embeds.length - 1)
    ),
  ];
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.toLowerCase().slice(1).replace(/_/gi, " ");
}

export function truncate(source: string, size: number) {
  return source.length > size ? source.slice(0, size - 1) + "…" : source;
}
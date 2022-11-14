import { Command } from "../../interfaces/Command";
import ms from "ms";
import {
  APIApplicationCommandOptionChoice,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const times: APIApplicationCommandOptionChoice<number>[] = [
  {
    name: "60 seconds",
    value: ms("60s"),
  },
  {
    name: "5 minutes",
    value: ms("5m"),
  },
  {
    name: "10 minutes",
    value: ms("10m"),
  },
  {
    name: "1 hour",
    value: ms("1h"),
  },
  {
    name: "1 day",
    value: ms("1d"),
  },
  {
    name: "1 week",
    value: ms("7d"),
  },
];

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member from the server.")
    .addNumberOption((option) =>
      option
        .setName("time")
        .setDescription("The amount of time to mute this member for.")
        .setChoices(...times)
        .setRequired(true)
    ),
} as Command;

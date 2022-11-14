import { Command } from "../../interfaces/Command";
import {
  EmbedBuilder,
  // ActionRowBuilder,
  // ButtonBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("links")
    .setDescription("See all the links related to the bot."),
  execute: async ({ client, interaction }) => {
    // TODO: make this prettier later
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[**Invite me**](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=288782)\n[**Join our support server**](https://discord.gg/Txm4FYNpNs)`
          )
          .setColor(colors.main),
      ],
      ephemeral: true,
    });
  },
} as Command;

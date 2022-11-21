import { Command } from "../../interfaces/Command";
import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { emotes } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("links")
    .setDescription("See all the links related to the bot."),
  execute: async ({ client, interaction }) => {
    interaction.reply({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setEmoji(emotes.logo)
            .setLabel("Invite me!")
            .setStyle(ButtonStyle.Link)
            .setURL(
              `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=1099914373180`
            ),
          new ButtonBuilder()
            .setEmoji(emotes.discord)
            .setLabel("Support server")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/Txm4FYNpNs")
        ),
      ],
      ephemeral: true,
    });
  },
} as Command;

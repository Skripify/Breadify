import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Get the member count of this server."),
  execute: async ({ interaction }) => {
    const { guild } = interaction;
    const members = guild.memberCount;
    const humans = guild.members.cache.filter(
      (member) => !member.user.bot
    ).size;
    const bots = guild.members.cache.filter((member) => member.user.bot).size;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `**Members**: ${members}\n**Humans**: ${humans}\n**Bots**: ${bots}`
          )
          .setColor(colors.main),
      ],
    });
  },
} as Command;

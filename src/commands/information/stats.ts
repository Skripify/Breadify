import { Command } from "../../interfaces/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View some of my statistics."),
  execute: async ({ client, interaction }) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
          })
          .addFields(
            {
              name: "📅 Created",
              value: `<t:${Math.round(client.user.createdTimestamp / 1000)}:f>`,
            },
            {
              name: "<a:countdown:1041603937268146217> Up since",
              value: `<t:${Math.round(client.startTime / 1000)}:f>`,
            },
            {
              name: "⚙️ Commands",
              value: `\`\`\`${client.commands.size.toLocaleString()}\`\`\``,
              inline: true,
            },
            {
              name: "📁 Servers",
              value: `\`\`\`${client.guilds.cache.size.toLocaleString()}\`\`\``,
              inline: true,
            },
            {
              name: "👤 Users",
              value: `\`\`\`${client.users.cache.size.toLocaleString()}\`\`\``,
              inline: true,
            }
          )
          .setColor(colors.main),
      ],
      ephemeral: true,
    });
  },
} as Command;

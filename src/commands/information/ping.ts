import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { colors } from "../../config";
import { Command } from "../../interfaces/Command";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings the bot."),
  execute: async ({ client, interaction }) => {
    await interaction
      .reply({
        embeds: [
          new EmbedBuilder().setDescription("Pinging...").setColor(colors.main),
        ],
        ephemeral: true,
        fetchReply: true,
      })
      .then((res) => {
        const ping = res.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `**🧠 Bot**: ${ping}ms\n**📶 API**: ${client.ws.ping}ms`
              )
              .setColor(colors.main),
          ],
        });
      });
  },
} as Command;

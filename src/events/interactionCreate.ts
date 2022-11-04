import { EmbedBuilder } from "discord.js";
import { colors } from "../config";
import { Event } from "../structures/Event";
import { Interaction } from "../types/Interaction";
import logger from "../utils/logger";

export default new Event("interactionCreate", async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Command could not be located.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });

    try {
      command.execute({
        client,
        interaction: interaction as Interaction,
      });
    } catch (err) {
      logger.error(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("An error occured on our end.")
            .setColor(colors.fail),
        ],
        ephemeral: true,
      });
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      command.autocomplete({ client, interaction });
    } catch (err) {
      logger.error(err);
    }
  }
});

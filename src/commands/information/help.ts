import { Command } from "../../interfaces/Command";
import { APIEmbedField, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { capitalize } from "../../utils/functions";
import { colors } from "../../config";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("See everything I can do."),
  execute: async ({ client, interaction }) => {
    const categories: APIEmbedField[] = [];

    fs.readdirSync(path.join(__dirname, "../../commands")).forEach((dir) => {
      const commands = fs
        .readdirSync(path.join(__dirname, `../../commands/${dir}`))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      const cmds = commands.map((command) => {
        let file: Command =
          require(`../../commands/${dir}/${command}`)?.default;
        if (!file.data) return;

        return `\`${file.data.toJSON().name}\``;
      });

      if (!cmds) return;

      categories.push({
        name: `${capitalize(dir)} [${cmds.length}]`,
        value: cmds.join(", "),
      });
    });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL(),
          })
          .setFields(categories)
          .setColor(colors.main),
      ],
      ephemeral: true,
    });
  },
} as Command;

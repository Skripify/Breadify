import {
  ChatInputCommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";

export interface Interaction extends ChatInputCommandInteraction {
  member: GuildMember;
  options: CommandInteractionOptionResolver<"cached">;
}

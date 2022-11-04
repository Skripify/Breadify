import {
  AutocompleteInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Bot } from "../structures/Client";
import { Interaction } from "../types/Interaction";

interface ExecuteParams {
  client?: Bot;
  interaction?: Interaction;
}

interface AutocompleteParams {
  client?: Bot;
  interaction?: AutocompleteInteraction;
}

interface ContextMenuExecuteParams {
  client?: Bot;
  interaction?: ContextMenuCommandInteraction;
}

export interface Command {
  data: SlashCommandBuilder;
  category?: string;
  execute: (params?: ExecuteParams) => any;
  autocomplete: (params?: AutocompleteParams) => any;
}

export interface ContextMenu {
  data: ContextMenuCommandBuilder;
  execute: (params?: ContextMenuExecuteParams) => any;
}

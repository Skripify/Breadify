import { Bot } from "./Client";

export class Feature {
  constructor(public run: (client: Bot) => unknown) {}
}

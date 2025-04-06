import { TestBot, captureRequests } from "../src/index.js";

import { Assert } from "@japa/assert";
import { Context } from "grammy";

export const createBot = <C extends Context = Context>() => {
  const bot = new TestBot<C>();

  bot.use(captureRequests);

  return bot;
};

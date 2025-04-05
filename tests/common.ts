import { TestBot, testing } from "../src/index.js";

import { Context } from "grammy";

export const createBot = <C extends Context = Context>() => {
  const bot = new TestBot<C>();

  bot.use(testing());

  return bot;
};

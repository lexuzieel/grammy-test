import { TestBot } from "../src/bot.js";
import { createBot } from "./common.js";

import { test } from "@japa/runner";
import { Context } from "grammy";

test.group("sample test", async (group) => {
  let bot: TestBot<Context>;

  group.each.setup(async () => {
    bot = createBot();
  });

  test("sample case", async ({ assert }) => {
    assert.equal(bot.user.id, 123456789);

    bot.on("message", async (ctx) => {
      await ctx.reply("Hello, world!");
    });

    await bot.receive.message("hello");
    bot.assert.reply.exact("Hello, world!");
  });
});

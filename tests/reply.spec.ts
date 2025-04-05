import { TestBot } from "../src/bot.js";
import { createBot } from "./common.js";

import { test } from "@japa/runner";
import { Context } from "grammy";

test.group("Reply", async (group) => {
  let bot: TestBot<Context>;

  group.each.setup(async () => {
    bot = createBot();
  });

  test("checks if reply contains exact text string", async ({ assert }) => {
    bot.on("message", async (ctx) => {
      await ctx.reply(
        "This is a very long response with specific text in the middle.",
      );
    });

    await bot.receive.message("hi");

    assert.throws(() => bot.assert.reply.exact("specific text"));
    assert.throws(() => bot.assert.reply.exact("long response"));

    bot.assert.reply.exact(
      "This is a very long response with specific text in the middle.",
    );
  });

  test("checks if reply contains substring", async ({ assert }) => {
    bot.on("message", async (ctx) => {
      await ctx.reply(
        "This is a very long response with specific text in the middle.",
      );
    });

    await bot.receive.message("hi");

    bot.assert.reply.contains("specific text");
    bot.assert.reply.contains("long response");

    assert.throws(() => bot.assert.reply.contains("non-existent text"));
  });
});

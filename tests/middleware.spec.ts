import { TestBot } from "../src/bot.js";
import { outgoingRequests, testMiddleware } from "../src/middleware.js";
import { createBot } from "./common.js";

import { test } from "@japa/runner";
import { Context } from "grammy";

test.group("Middleware", async (group) => {
  let bot: TestBot<Context>;

  group.each.setup(async () => {
    bot = createBot();
  });

  group.each.teardown(async () => {
    // Clear requests between tests
    outgoingRequests.delete(bot.token);
  });

  test("captures outgoing requests", async ({ assert }) => {
    bot.on("message", async (ctx) => {
      await ctx.reply("Test message");
    });

    assert.isEmpty(bot.requests);

    await bot.receive.message("hello");

    assert.lengthOf(bot.requests, 1);
  });

  test("skips duplicate requests", async ({ assert }) => {
    // Register a handler that sends the same message twice
    bot.on("message", async (ctx) => {
      // Send identical messages
      await ctx.reply("Duplicate");
      await ctx.reply("Duplicate");

      // Send a different message
      await ctx.reply("Unique");
    });

    assert.isEmpty(bot.requests);

    await bot.receive.message("hello");

    assert.lengthOf(bot.requests, 2);
    assert.equal(bot.requests[0].payload.text, "Duplicate");
    assert.equal(bot.requests[1].payload.text, "Unique");
  });
});

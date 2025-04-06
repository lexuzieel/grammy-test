import { TestBot } from "../src/bot.js";
import { createBot } from "./common.js";

import { test } from "@japa/runner";
import { Context } from "grammy";

test.group("Bot", async (group) => {
  let bot: TestBot<Context>;

  group.each.setup(async () => {
    bot = createBot();
  });

  test("initializes with default user and bot info", async ({ assert }) => {
    // Check default user
    assert.equal(bot.user.id, 123456789);
    assert.equal(bot.user.firstName, "Test");
    assert.equal(bot.user.lastName, "User");
    assert.equal(bot.user.username, "test_user");

    // Check bot info
    assert.equal(bot.botInfo.id, 1);
    assert.equal(bot.botInfo.first_name, "Test Bot");
    assert.equal(bot.botInfo.is_bot, true);
    assert.equal(bot.botInfo.username, "test_bot");
  });

  test("captures outgoing requests", async ({ assert }) => {
    bot.on("message", async (ctx) => {
      await ctx.reply("Hello, user!");
    });

    await bot.receive.message("hello");

    assert.lengthOf(bot.requests, 1);
    assert.equal(bot.requests[0].method, "sendMessage");
    assert.equal(bot.requests[0].payload.chat_id, bot.user.id);
    assert.equal(bot.requests[0].payload.text, "Hello, user!");
  });

  test("handles multiple messages", async ({ assert }) => {
    // Setup a more complex conversation
    bot.on("message:text", async (ctx) => {
      const text = ctx.message.text.toLowerCase();

      if (text === "hello") {
        await ctx.reply("Hi there!");
      } else if (text === "how are you?") {
        await ctx.reply("I'm doing well, thanks for asking!");
      } else {
        await ctx.reply("I don't understand that message.");
      }
    });

    // First message
    await bot.receive.message("Hello");
    bot.assert.reply.exact("Hi there!");
    assert.lengthOf(bot.requests, 1);

    // Second message
    await bot.receive.message("How are you?");
    bot.assert.reply.exact("I'm doing well, thanks for asking!");
    assert.lengthOf(bot.requests, 1);

    // Unknown message
    await bot.receive.message("Something random");
    bot.assert.reply.exact("I don't understand that message.");
    assert.lengthOf(bot.requests, 1);
  });

  test("receives incoming text messages", async ({ assert }) => {
    let ctx: Context | null = null;

    bot.on("message", async (c) => {
      ctx = c;
    });

    await bot.receive.message("hello");

    assert.isNotNull(ctx);
    assert.equal(ctx!.message?.text, "hello");
  });

  test("receives incoming commands", async ({ assert }) => {
    let ctx: Context | null = null;

    bot.on("message", async (c) => {
      ctx = c;
    });

    await bot.receive.command("test_command");

    assert.isNotNull(ctx);
    assert.equal(ctx!.message?.text, "/test_command");
  });

  test("receives incoming commands with arguments", async ({ assert }) => {
    let ctx: Context | null = null;

    bot.on("message", async (c) => {
      ctx = c;
    });

    await bot.receive.command("test_command", "hello", "world");

    assert.isNotNull(ctx);
    assert.equal(ctx!.hasCommand("test_command"), true);
    assert.equal(ctx!.match, "hello world");
  });

  test("receives callback queries", async ({ assert }) => {
    let ctx: Context | null = null;

    bot.on("callback_query", async (c) => {
      ctx = c;
    });

    await bot.receive.callbackQuery("test_data");

    assert.isNotNull(ctx);
    assert.equal(ctx!.hasCallbackQuery("test_data"), true);
    assert.equal(ctx!.match, "test_data");
  });
});

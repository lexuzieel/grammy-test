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

    // Second message
    await bot.receive.message("How are you?");
    bot.assert.reply.exact("I'm doing well, thanks for asking!");

    // Unknown message
    await bot.receive.message("Something random");
    bot.assert.reply.exact("I don't understand that message.");
  });

  test("can assert that reply contains exact text", async ({ assert }) => {
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

  test("can assert that reply contains specific text", async ({ assert }) => {
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

  test("can change user information", async ({ assert }) => {
    bot.on("message", async (ctx) => {
      const userName = ctx.from?.first_name || "Unknown";
      await ctx.reply(`Hello, ${userName}!`);
    });

    // Use a custom user
    await bot.receive.from({ firstName: "Alice" }).message("hi");

    bot.assert.reply.exact("Hello, Alice!");
  });

  test("multiple handlers for different scenarios", async ({ assert }) => {
    // Command handler
    bot.command("start", async (ctx) => {
      await ctx.reply("Bot started!");
    });

    // Text message handler
    bot.on("message:text", async (ctx) => {
      await ctx.reply("Text received!");
    });

    // Test command handler
    await bot.receive.command("start");
    bot.assert.reply.exact("Bot started!");

    // Test text message handler
    await bot.receive.message("just some text");
    bot.assert.reply.exact("Text received!");
  });
});

import { TestBot } from "../src/bot.js";
import { Generator } from "../src/generator.js";
import { createBot } from "./common.js";

import { Assert } from "@japa/assert";
import { test } from "@japa/runner";
import { Context } from "grammy";
import { Chat, Message, Update, User } from "grammy/types";

test.group("Generator", async (group) => {
  let bot: TestBot<Context>;
  let generator: Generator;

  group.each.setup(async () => {
    bot = createBot();
    generator = new Generator(bot);
  });

  /**
   * Below are the utility functions to verify constructed updates.
   */

  const checkUpdate = (assert: Assert, update: Update) => {
    assert.isAbove(update.update_id, 0);
    assert.isDefined(update.message);
  };

  const checkChat = (assert: Assert, chat: Chat) => {
    assert.equal(chat.type, "private");
    assert.equal(chat.id, bot.user.id);
  };

  const checkUser = (assert: Assert, user: User) => {
    assert.equal(user.id, bot.user.id);
    assert.equal(user.first_name, bot.user.firstName);
    assert.equal(user.last_name, bot.user.lastName);
    assert.equal(user.username, bot.user.username);
    assert.equal(user.is_bot, false);
  };

  const checkMessage = (assert: Assert, update: Update) => {
    checkUpdate(assert, update);

    const message = update.message as Message;

    assert.isAbove(message.message_id, 0);
    assert.isAbove(message.date, 0);
    assert.isBelow(message.date, Date.now());

    checkChat(assert, message.chat as Chat);
    checkUser(assert, message.from as User);
  };

  const checkCommand = (assert: Assert, update: Update, command: string) => {
    checkMessage(assert, update);

    const message = update.message as Message;

    assert.isDefined(message.entities);
    assert.isNotEmpty(message.entities);

    const entity = message.entities![0];
    assert.equal(entity.type, "bot_command");
    assert.equal(entity.offset, 0);
    assert.equal(entity.length, command.length + 1);
  };

  /**
   * Tests for the update generator.
   */

  test("creates updates with unique id", async ({ assert }) => {
    const update1 = generator.message("First message");
    const update2 = generator.message("Second message");

    assert.isAbove(update1.update_id, 0);
    assert.isAbove(update2.update_id, 0);
    assert.notEqual(update1.update_id, update2.update_id);
  });

  test("can change user information", async ({ assert }) => {
    // Change the user
    const customUserId = 987654321;
    generator.user = {
      ...generator.user,
      id: customUserId,
      firstName: "Custom",
      lastName: "User",
      username: "custom_user",
    };

    // Generate a message with the new user data
    const update = generator.message("Hello from custom user");

    const chat = update.message?.chat as Chat;

    // Chat should be the same as the user's id
    assert.equal(chat.id, customUserId);

    const user = update.message?.from as User;

    // User information should be the same as the one defined in the generator
    assert.equal(user.id, customUserId);
    assert.equal(user.first_name, "Custom");
    assert.equal(user.last_name, "User");
    assert.equal(user.username, "custom_user");
  });

  test("builds text message", async ({ assert }) => {
    const text = "Sample text message";
    const update = generator.message(text);

    assert.equal(update.message?.text, text);

    checkMessage(assert, update);
  });

  test("builds command", async ({ assert }) => {
    const command = "start";
    const update = generator.command(command);

    assert.equal(update.message?.text, `/${command}`);

    checkCommand(assert, update, command);
  });

  test("builds command with arguments", async ({ assert }) => {
    const command = "start";
    const args = ["arg1", "arg2"];
    const update = generator.command(command, args);

    assert.equal(update.message?.text, `/${command} ${args.join(" ")}`);
  });
});

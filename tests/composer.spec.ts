import { TestBot } from "../src/bot.js";
import { Composer } from "../src/composer.js";
import { createBot } from "./common.js";

import { test } from "@japa/runner";
import { Context } from "grammy";
import { User } from "grammy/types";

test.group("Composer", async (group) => {
  let bot: TestBot<Context>;
  let composer: Composer;

  group.each.setup(async () => {
    bot = createBot();
    composer = new Composer(bot);
  });

  test("can change user information", async ({ assert }) => {
    const id = Math.floor(Math.random() * 1000000);
    const firstName = "John";
    const lastName = "Doe";
    const username = "john_doe";

    let user: User | null = null;

    bot.on("message", async (ctx) => {
      user = ctx.from;
    });

    await composer
      .from({
        id: id,
        firstName: firstName,
        lastName: lastName,
        username: username,
      })
      .message("message with custom user data");

    assert.isNotNull(user);
    assert.equal(user!.id, id);
    assert.equal(user!.first_name, firstName);
    assert.equal(user!.last_name, lastName);
    assert.equal(user!.username, username);
  });
});

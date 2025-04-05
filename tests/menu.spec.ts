import { TestBot } from "../src/bot.js";
import { createBot } from "./common.js";

import { Menu } from "@grammyjs/menu";
import { test } from "@japa/runner";
import { Context } from "grammy";

test.group("Menu", (group) => {
  let bot: TestBot<Context>;

  group.each.setup(async () => {
    bot = createBot();
  });

  test("emulates inline keyboard buttons", async ({ assert }) => {
    const menu = new Menu("test_menu", {
      autoAnswer: false,
    });

    menu
      .text("Option 1", async (ctx) => {
        ctx.menu.close();
        await ctx.reply("Option 1 clicked");
      })
      .row()
      .text("Option 2", async (ctx) => {
        ctx.menu.close();
        await ctx.reply("Option 2 clicked");
      });

    bot.use(menu);

    bot.command("start", (ctx) => {
      ctx.reply("Pick an option", {
        reply_markup: menu,
      });
    });

    await bot.receive.command("start");

    bot.assert.reply.exact("Pick an option");

    bot.assert.button.exact("Option 1");
    bot.assert.button.exact("Option 2");

    assert.throws(() => bot.assert.button.exact("Option 3"));
    assert.throws(() => bot.assert.button.contains("Option 3"));

    await bot.receive.button("Option 1");

    bot.assert.reply.exact("Option 1 clicked");

    let error: Error | undefined;

    try {
      await bot.receive.button("Option 1");
      await bot.receive.button("Option 2");
    } catch (e) {
      error = e as Error;
    }

    assert.typeOf(
      error,
      "Error",
      "Pressing non-existent button should throw an error"
    );

    await bot.receive.command("start");

    await bot.receive.button("Option 2");

    bot.assert.reply.exact("Option 2 clicked");
  });
});

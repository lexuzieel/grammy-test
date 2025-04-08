import { TestBot } from "./bot.js";
import { Generator } from "./generator.js";
import { User } from "./types.js";

import { Context } from "grammy";
import { InlineKeyboardButton } from "grammy/types";

/**
 * Incoming bot messages composer.
 *
 * It is used to simulate incoming bot messages during testing:
 *
 * ```ts
 * await bot.receive.command("/start");
 * ```
 */
export class Composer {
  private generator: Generator;

  constructor(private readonly bot: TestBot<Context>) {
    this.generator = new Generator(bot);
  }

  public from(user: Partial<User>) {
    this.generator.user = { ...this.generator.user, ...user };
    return this;
  }

  public async message(text: string) {
    this.bot.resetRequests();
    await this.bot.handleUpdate(this.generator.message(text));
  }

  public async command(command: string, ...args: string[]) {
    this.bot.resetRequests();
    await this.bot.handleUpdate(this.generator.command(command, args));
  }

  public async callbackQuery(data: string) {
    this.bot.resetRequests();
    await this.bot.handleUpdate(this.generator.callbackQuery(data));
  }

  public async button(text: string) {
    for (const r of this.bot.requests) {
      const button = (r.payload.reply_markup?.inline_keyboard ?? [])
        .flat()
        .find((b: InlineKeyboardButton) =>
          b.text.toLowerCase().includes(text.toLowerCase())
        );

      if (button) {
        this.bot.resetRequests();
        await this.bot.handleUpdate(
          this.generator.callbackQuery(button.callback_data)
        );
        return;
      }
    }

    throw new Error(`No button with text '${text}' found`);
  }
}

import { InlineKeyboardButton } from "grammy/types";
import { Composer } from "./composer.js";
import { outgoingRequests } from "./middleware.js";
import { Request, User } from "./types.js";

import { assert } from "chai";
import crypto from "crypto";
import { Api, Bot, Context, RawApi } from "grammy";

/**
 * Instance of grammY bot to be used in tests.
 *
 * This class extends grammY's {@link Bot} class to intercept outgoing
 * bot messages and adds methods to assert incoming user messages.
 */
export class TestBot<
  C extends Context = Context,
  A extends Api = Api<RawApi>
> extends Bot<C, A> {
  public user: User;

  constructor() {
    super(`test-${crypto.randomUUID()}`);

    this.user = {
      id: 123456789,
      firstName: "Test",
      lastName: "User",
      username: "test_user",
    };

    this.botInfo = {
      id: 1,
      first_name: "Test Bot",
      is_bot: true,
      username: "test_bot",
      can_join_groups: false,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
    };
  }

  /**
   * Use this object to emulate incoming messages from the user.
   *
   * @example
   * ```ts
   * await bot.receive.command("start");
   * await bot.receive.message("Hello, world!");
   * ```
   */
  public get receive() {
    return new Composer(this as unknown as TestBot<Context>);
  }

  /**
   * A list of captured outgoing requests
   * since the last call input from the user.
   *
   * Note: This list gets cleared on each call to a `receive.*` method,
   * such as `bot.receive.message()`, `bot.receive.command()`, etc.
   */
  public get requests() {
    if (!outgoingRequests.has(this.token)) {
      outgoingRequests.set(this.token, []);
    }

    return outgoingRequests.get(this.token) as Request[];
  }

  /**
   * Clear the list of captured outgoing requests.
   *
   * This method is used internally by the `receive.*` methods.
   */
  public resetRequests() {
    outgoingRequests.set(this.token, []);
  }

  /**
   * Format outgoing requests as a list.
   */
  protected get logText() {
    return this.requests.map((r) => r.payload.text).join("\n");
  }

  /**
   * Use this object to assert the updates sent by the bot.
   */
  public get assert() {
    return {
      /**
       * Assert a message that was sent with `ctx.reply`.
       */
      reply: {
        /**
         * Match the exact text of a message that was sent with `ctx.reply`.
         */
        exact: (text: string) => {
          if (
            !this.requests.find(
              (r) => r.payload.text && r.payload.text === text
            )
          ) {
            assert.fail(
              this.logText,
              text,
              `No message was sent with exact text '${text}'`
            );
          }
        },
        /**
         * Match a substring of a message that was sent with `ctx.reply`.
         */
        contains: (text: string) => {
          if (
            !this.requests.find(
              (r) =>
                r.payload.text &&
                r.payload.text.toLowerCase().includes(text.toLowerCase())
            )
          ) {
            assert.fail(
              `No message was sent with text containing '${text}'\n\nGot: ${this.logText}`
            );
          }
        },
      },
      /**
       * Assert an inline button that was sent with `reply_markup`.
       */
      button: (text: string) => {
        if (
          !this.requests.find((r) => {
            const button = (r.payload.reply_markup?.inline_keyboard ?? [])
              .flat()
              .find((b: InlineKeyboardButton) =>
                b.text.toLowerCase().includes(text.toLowerCase())
              );

            return button;
          })
        ) {
          assert.fail(`No button with text '${text}' found`);
        }
      },
    };
  }
}

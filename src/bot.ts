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
  A extends Api = Api<RawApi>,
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
   * Use this object to simulate incoming messages from the user.
   *
   * @example
   * ```ts
   * await bot.receive.command("/start");
   * await bot.receive.message("Hello, world!");
   * ```
   */
  public get receive() {
    return new Composer(this as unknown as TestBot<Context>);
  }

  /**
   * Get the log of outgoing requests.
   * @returns The complete log of outgoing requests.
   */
  public get log() {
    if (!outgoingRequests.has(this.token)) {
      outgoingRequests.set(this.token, []);
    }

    return outgoingRequests.get(this.token) as Request[];
  }

  public clearLog() {
    outgoingRequests.set(this.token, []);
  }

  public get lastRequest() {
    return this.log.length > 0 ? this.log[0] : undefined;
  }

  /**
   * Use this object to assert outgoing bot messages.
   */
  public get assert() {
    return {
      /**
       * Assert bot messages that were sent with `ctx.reply`.
       */
      reply: {
        exact: (text: string) => {
          if (!this.log.find((r) => r.payload.text === text)) {
            const logText = this.log
              .reverse()
              .map((r) => r.payload.text)
              .join("\n");

            assert.fail(
              logText,
              text,
              `No message was sent with exact text '${text}'`,
            );
          }
        },
        contains: (text: string) => {
          if (!this.log.find((r) => r.payload.text.includes(text))) {
            const logText = this.log
              .reverse()
              .map((r) => r.payload.text)
              .join("\n");

            assert.fail(
              `No message was sent with text containing '${text}'\n\nGot: ${logText}`,
            );
          }
        },
      },
      button: {
        exact: (text: string) => {
          if (
            !this.log.find((r) => {
              const button = (r.payload.reply_markup?.inline_keyboard ?? [])
                .flat()
                .find((b: InlineKeyboardButton) => b.text === text);

              return button;
            })
          ) {
            assert.fail(`No button with text '${text}' found`);
          }
        },
        contains: (text: string) => {
          if (
            !this.log.find((r) => {
              const button = (r.payload.reply_markup?.inline_keyboard ?? [])
                .flat()
                .find((b: InlineKeyboardButton) => b.text.includes(text));

              return button;
            })
          ) {
            assert.fail(`No button with text containing '${text}' found`);
          }
        },
      },
    };
  }
}

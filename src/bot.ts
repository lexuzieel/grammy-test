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
  protected get log() {
    if (!outgoingRequests.has(this.token)) {
      outgoingRequests.set(this.token, []);
    }

    return outgoingRequests.get(this.token) as Request[];
  }

  /**
   * Get the last n requests from the log.
   * @param n - The number of requests to get.
   * @returns The last n requests from the log.
   */
  protected last(n: number = 1) {
    return this.log.length >= n ? this.log.slice(-n) : this.log;
  }

  /**
   * Use this object to assert outgoing bot messages.
   */
  public get assert() {
    const latest = this.last(3).reverse();
    const latestText = latest.map((r) => r.payload.text).join("\n");
    return {
      /**
       * Assert bot messages that were sent with `ctx.reply`.
       */
      reply: {
        exact: (text: string) => {
          if (!latest.find((r) => r.payload.text === text)) {
            assert.fail(
              latestText,
              text,
              `No message was sent with exact text '${text}'`,
            );
          }
        },
        contains: (text: string) => {
          if (!latest.find((r) => r.payload.text.includes(text))) {
            assert.fail(
              `No message was sent with text containing '${text}'\n\nGot: ${latestText}`,
            );
          }
        },
      },
    };
  }
}

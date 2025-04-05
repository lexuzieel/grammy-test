import { TestBot } from "./bot.js";
import { User } from "./types.js";

import { Context } from "grammy";
import { Update } from "grammy/types";

/**
 * Incoming bot messages generator.
 *
 * It is a helper class to create bot {@link Update} objects.
 */
export class Generator {
  public user: User;

  static counter = 1;

  constructor(private readonly bot: TestBot<Context>) {
    this.user = bot.user;
  }

  private get id(): number {
    return Generator.counter++;
  }

  private get date(): number {
    return Math.floor(Date.now() / 1000);
  }

  private get from() {
    return {
      is_bot: false,
      id: this.user.id,
      first_name: this.user.firstName,
      last_name: this.user.lastName,
      username: this.user.username,
    };
  }

  public message(text: string): Update {
    return {
      update_id: this.id,
      message: {
        date: this.date,
        chat: {
          type: "private",
          ...this.from,
        },
        message_id: this.id,
        from: this.from,
        text,
      },
    };
  }

  public command(command: string): Update {
    return {
      update_id: this.id,
      message: {
        date: this.date,
        chat: {
          type: "private",
          ...this.from,
        },
        message_id: this.id,
        from: this.from,
        text: command,
        entities: [
          {
            offset: 0,
            length: command.length,
            type: "bot_command",
          },
        ],
      },
    };
  }
}

[![codecov](https://codecov.io/gh/lexuzieel/grammy-test/graph/badge.svg?token=rpkZN6YB7k)](https://codecov.io/gh/lexuzieel/grammy-test)

# Testing framework for grammY

## Install the package in your project

```bash
npm install grammy-test
```

## Use it inside your tests

```ts
import { Context } from "grammy";
import { TestBot, testing } from "grammy-test";

let bot: TestBot<Context>;

beforeEach(() => {
  bot = new TestBot<Context>();
  bot.use(testing());
});

describe("bot", () => {
  it("should reply to a message", async () => {
    // Attach message handler to the bot
    bot.on("message:text", async (ctx) => {
      await ctx.reply("Hello, world!");
    });

    // Simulate a message from a user
    await bot.receive.message("hello");

    // Assert that the bot replied with the correct message
    bot.assert.reply.exact("Hello, world!");
  });
});
```

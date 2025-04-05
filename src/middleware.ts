import { Request } from "./types.js";

import { Context, Middleware } from "grammy";

export const outgoingRequests: Map<string, Request[]> = new Map();

/**
 * Middleware that catches all outgoing requests and returns a fake
 * response when testing a grammY bot.
 *
 * This prevents actual API calls to Telegram while testing.
 */
export const testMiddleware = <C extends Context>(): Middleware<C> => {
  return async (ctx, next) => {
    let storage = outgoingRequests.get(ctx.api.token);

    if (!storage) {
      outgoingRequests.set(ctx.api.token, []);
      storage = outgoingRequests.get(ctx.api.token) as Request[];
    }

    ctx.api.config.use((_, method, payload, __) => {
      const updateId = ctx.update.update_id;

      // Only add the request if it's not a duplicate from the same update
      const isDuplicate = storage.some(
        (r) =>
          r.updateId === updateId &&
          r.method === method &&
          JSON.stringify(r.payload) === JSON.stringify(payload),
      );

      if (!isDuplicate) {
        storage.push({
          updateId,
          method,
          payload,
        });
      }

      return { ok: true } as any;
    });

    return next();
  };
};

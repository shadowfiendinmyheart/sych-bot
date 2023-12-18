import { Context } from "telegraf";

import { CallbackFunction } from "../types/functions";

export const loggerMiddleware = async (ctx: Context, next: CallbackFunction) => {
  if (ctx.message) {
    const message = ctx.message;
    const from = message.from.username
      ? "from: " + message.from.username
      : "from id: " + message.from.id;
    console.log(
      `new message
       id: ${message.message_id}
       ${from}\n`,
    );
  }
  next();
};

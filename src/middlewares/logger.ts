import { Context } from 'telegraf';

import { callbackFunction } from '../types/functions';

export const debugLogger = async (ctx: Context, next: callbackFunction) => {
  if (ctx.message) {
    const message = ctx.message;
    console.log(
      `new message
       id: ${message.message_id}
       from: ${message.from.username}\n`
    );
  }
  next();
};

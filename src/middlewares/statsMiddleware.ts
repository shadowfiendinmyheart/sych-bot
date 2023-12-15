import { Context } from "telegraf";
import { addUserId } from "../services/stats";

import { CallbackFunction } from "../types/functions";

export const statsMiddleware = async (ctx: Context, next: CallbackFunction) => {
  const userId = ctx.from?.id || 0;
  addUserId(userId);
  next();
};

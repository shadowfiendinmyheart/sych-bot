import { Context } from "telegraf";
import { callbackFunction } from "../types/functions";

export const stopLoadingInlineButton = async (
  ctx: Context,
  next: callbackFunction
) => {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
  }
  next();
};

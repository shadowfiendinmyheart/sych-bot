import { Context } from "telegraf";
import { CallbackFunction } from "../types/functions";

export const stopLoadingInlineButton = async (
  ctx: Context,
  next: CallbackFunction,
) => {
  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
  }
  next();
};

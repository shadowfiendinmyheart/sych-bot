import { Context } from "telegraf";
import { CallbackFunction } from "../types/functions";

export const stopLoadingInlineButton = async (
  ctx: Context,
  next: CallbackFunction,
) => {
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }
  } catch (error) {
    console.log("answerCbQuery error:", error);
  } finally {
    next();
  }
};

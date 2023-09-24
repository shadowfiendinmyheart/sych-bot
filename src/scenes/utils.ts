import { Context } from "telegraf";
import { ERRORS } from "../const";

export const userErrorHanlder = async (ctx: Context, error: any) => {
  switch (error.message) {
    case ERRORS.EMPTY_SUGGESTION: {
      await ctx.reply("У вас нет предложки");
      break;
    }

    default: {
      await ctx.reply("Произошла ошибка на сервере... Попробуйте позже");
      console.log("---");
      console.log("error:", error);
      console.log("ctx:", ctx);
      console.log("---");
    }
  }
};

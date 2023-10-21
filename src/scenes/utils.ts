import { Context } from "telegraf";
import { ERRORS } from "../const";

export const errorHandler = async (ctx: Context, error: any) => {
  switch (error.message) {
    case ERRORS.WRONG_STATUS_SUGGESTION: {
      await ctx.reply("Неверный статус предложки");
      break;
    }

    case ERRORS.EMPTY_SUGGESTION: {
      await ctx.reply("У вас нет предложки");
      break;
    }

    case ERRORS.EMPTY_USER_SUGGESTIONS: {
      await ctx.reply("У вас нет предложки");
      break;
    }

    case ERRORS.ADMIN_EMPTY_SUGGESTION: {
      await ctx.reply("Тут больше ничего нет...");
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

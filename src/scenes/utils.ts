import { Context } from "telegraf";
import { ERRORS } from "../const";

interface ErrorHandlerParams {
  ctx: Context;
  error: any;
}

interface ErrorHandlerWithLoggerParams extends ErrorHandlerParams {
  about?: string;
}

export const logger = (ctx: Context, x: any, prefix = "something interesting:") => {
  console.log("-----");
  console.log(`${prefix}: ${x}`);
  console.log("ctx", ctx);
  console.log("-----");
};

export const errorHandlerWithLogger = async ({
  about,
  ...params
}: ErrorHandlerWithLoggerParams) => {
  logger(params.ctx, about, "ERROR");
  errorHandler(params);
};

export const errorHandler = async ({ ctx, error }: ErrorHandlerParams) => {
  switch (error.message) {
    case ERRORS.WRONG_STATUS_SUGGESTION: {
      await ctx.reply("Неверный статус предложки");
      break;
    }

    case ERRORS.EMPTY_SUGGESTION: {
      await ctx.reply("У вас нет предложки");
      break;
    }

    case ERRORS.ADMIN_EMPTY_SUGGESTION: {
      await ctx.reply("Из предложки тут больше ничего нет...");
      break;
    }

    case ERRORS.SAVE_SUGGESTION: {
      await ctx.reply("Во время сохранения предложки произошла ошибка");
      break;
    }

    case ERRORS.GET_VK_POST: {
      await ctx.reply("Ошибка запроса к серверам VK");
      break;
    }

    case ERRORS.GET_RANDOM_VK_POST: {
      await ctx.reply(
        "Упс! Произошла ошибка. Сейчас эта функция временно недоступна :(",
      );
      break;
    }

    default: {
      await ctx.reply("Произошла ошибка на сервере... Попробуйте позже");
    }
  }
};

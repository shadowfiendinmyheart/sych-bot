import { Context } from "telegraf";

export const userErrorHanlder = async (ctx: Context, error: any) => {
  await ctx.reply("Произошла ошибка на сервере... Попробуйте позже");
  console.log("---");
  console.log("error:", error);
  console.log("ctx:", ctx);
  console.log("---");
};

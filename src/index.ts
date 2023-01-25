import "dotenv/config";
import { Telegraf, session, Scenes } from "telegraf";
import { stopLoadingInlineButton } from "./middlewares/inlineKeyboardMiddleware";

import { debugLogger } from "./middlewares/logger";

import authScene from "./scenes/MenuScene";
import sendRoomScene from "./scenes/SendRoomScene";
import aboutRoomScene from "./scenes/AboutRoomScene";
import reposterScene from "./scenes/ReposterScene";

import { SceneAlias } from "./types/scenes";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf<Scenes.SceneContext>(process.env.BOT_TOKEN as string);
const stage = new Scenes.Stage<Scenes.SceneContext>([
  authScene,
  sendRoomScene,
  aboutRoomScene,
  reposterScene,
]);

bot.use(debugLogger);
bot.use(stopLoadingInlineButton);
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.reply("Вас приветствует Сычебот v.1");
  ctx.scene.enter(SceneAlias.Menu);
});

bot.on("message", async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

bot.launch();

console.log("working . . .");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

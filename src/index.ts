import config from "./config";
import * as fs from "fs";
import { Telegraf, session, Scenes } from "telegraf";
import { stopLoadingInlineButton } from "./middlewares/inlineKeyboardMiddleware";

import { debugLogger } from "./middlewares/logger";

import authScene from "./scenes/MenuScene";
import sendRoomScene from "./scenes/SendRoomScene";
import aboutRoomScene from "./scenes/AboutRoomScene";
import reposterScene from "./scenes/ReposterScene";
import photoSuggestionScene from "./scenes/PhotoSuggestionScene";
import descriptionSuggestionScene from "./scenes/DescriptionSuggestionScene";

import { SceneAlias } from "./types/scenes";
import { PATHS } from "./const";

if (!config.BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf<Scenes.SceneContext>(config.BOT_TOKEN as string);
const stage = new Scenes.Stage<Scenes.SceneContext>([
  authScene,
  sendRoomScene,
  aboutRoomScene,
  reposterScene,
  photoSuggestionScene,
  descriptionSuggestionScene,
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

// init folders
PATHS.forEach((path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

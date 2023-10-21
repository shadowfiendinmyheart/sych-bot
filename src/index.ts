import config from "./config";
import * as fs from "fs";
import { Telegraf, session, Scenes } from "telegraf";
import { stopLoadingInlineButton } from "./middlewares/inlineKeyboardMiddleware";

import { debugLogger } from "./middlewares/logger";

import authScene from "./scenes/MenuScene";
import suggestionScene from "./scenes/SuggestionScene";
import reposterScene from "./scenes/ReposterScene";
import photoSuggestionScene from "./scenes/PhotoSuggestionScene";
import descriptionSuggestionScene from "./scenes/DescriptionSuggestionScene";
import adminScene from "./scenes/AdminScene";
import refuseScene from "./scenes/RefuseScene";

import { SceneAlias } from "./types/scenes";
import { PATHS } from "./const";

if (!config.BOT_TOKEN) {
  throw Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf<Scenes.SceneContext>(config.BOT_TOKEN as string);
const stage = new Scenes.Stage<Scenes.SceneContext>([
  authScene,
  suggestionScene,
  reposterScene,
  photoSuggestionScene,
  descriptionSuggestionScene,
  adminScene,
  refuseScene,
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

// TODO: init files

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

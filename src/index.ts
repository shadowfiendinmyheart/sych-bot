import config from "./config";
import { Telegraf, session, Scenes } from "telegraf";
import { stopLoadingInlineButton } from "./middlewares/inlineKeyboardMiddleware";

import { debugLogger } from "./middlewares/logger";

import menuScene from "./scenes/MenuScene";
import suggestionScene from "./scenes/SuggestionScene";
import reposterScene from "./scenes/ReposterScene";
import photoSuggestionScene from "./scenes/PhotoSuggestionScene";
import descriptionSuggestionScene from "./scenes/DescriptionSuggestionScene";
import adminScene from "./scenes/AdminScene";
import refuseScene from "./scenes/RefuseScene";

import { SceneAlias } from "./types/scenes";
import { initFiles } from "./utils/init";
import { unexceptedUserInputHandler } from "./utils/sceneHandler";

if (!config.BOT_TOKEN) {
  throw Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf<Scenes.SceneContext>(config.BOT_TOKEN as string);
const scenes = [
  menuScene,
  suggestionScene,
  reposterScene,
  photoSuggestionScene,
  descriptionSuggestionScene,
  adminScene,
  refuseScene,
];
const stage = new Scenes.Stage<Scenes.SceneContext>(scenes);
unexceptedUserInputHandler(scenes);

bot.use(debugLogger);
bot.use(stopLoadingInlineButton);
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.reply("Вас приветствует Сычебот v.1");
  ctx.scene.enter(SceneAlias.Menu);
});

bot.on("text", async (ctx) => {
  ctx.scene.enter(ctx.scene.current?.id || SceneAlias.Menu);
});

bot.launch();
initFiles();

console.log("working . . .");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

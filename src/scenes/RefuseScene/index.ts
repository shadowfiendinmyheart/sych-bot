import { Scenes } from "telegraf";
import { makePostToTg } from "../../services/api/tgApi";
import { updateSuggestion } from "../../services/suggestion";

import { SceneAlias } from "../../types/scenes";
import { errorHandler } from "../utils";
import {
  getNextRefusedSuggestionKeyboard,
  getPreparedForRefuseSuggestion,
  getRefuseMenuKeyboard,
  refuseSuggestion,
} from "./utils";

export enum RefuseKeyboard {
  GetNextSuggestion = "GetNextSuggestion",
  ReturnSuggestion = "ReturnSuggestion",
  UseDefaultPhrase = "UseDefaultPhrase",
  Back = "Back",
  Confirm = "Confirm",
  Cancel = "Cancel",
}

const DEFAULT_CODE_PHRASE = "default";
const defaultText =
  "Привет, сейчас не можем выложить твой пост, т.к. он не соответствует формату канала. Постарайся добавить общий вид сычевальни, можешь ориентироваться на те посты, которые уже были опубликованы";
const enterText = `Напишите причину отказа \nЧтобы установить дефолтную фразу, отправьте сообщение, которое начинается со слова <code>/${DEFAULT_CODE_PHRASE}</code>`;
const nextSuggestionText = "Показать следующий пост?";
const refuseScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Refuse);

refuseScene.enter(async (ctx) => {
  try {
    const chatId = ctx.chat?.id;
    await ctx.reply(enterText);

    const suggestion = await getPreparedForRefuseSuggestion();
    await ctx.reply("Отклоняемый пост:", { parse_mode: "HTML" });
    await makePostToTg({
      post: { photos: suggestion.fileIds, text: suggestion.caption },
      chatId: String(chatId),
    });
    await ctx.reply("Что будем делать?", getRefuseMenuKeyboard());
  } catch (error) {
    await errorHandler(ctx, error);
    await ctx.scene.enter(SceneAlias.Admin);
  }
});

refuseScene.on("text", async (ctx) => {
  try {
    const text = ctx.message.text;
    const suggestion = await getPreparedForRefuseSuggestion();

    // send message to author with notification about post
    await refuseSuggestion(suggestion, text);
    await ctx.reply("Пост отклонён!");
    await ctx.reply(nextSuggestionText, getNextRefusedSuggestionKeyboard());
  } catch (error) {
    await errorHandler(ctx, error);
  }
});

refuseScene.action(RefuseKeyboard.GetNextSuggestion, async (ctx) => {
  try {
    const suggestion = await getPreparedForRefuseSuggestion();
    await ctx.reply("Отклоняемый пост:");
    await makePostToTg({
      post: { photos: suggestion.fileIds, text: suggestion.caption },
      chatId: String(suggestion.userId),
    });
    await ctx.reply("Что будем делать?", getRefuseMenuKeyboard());
  } catch (error) {
    await errorHandler(ctx, error);
  }
});

refuseScene.action(RefuseKeyboard.ReturnSuggestion, async (ctx) => {
  try {
    const suggestion = await getPreparedForRefuseSuggestion();
    await updateSuggestion({
      id: suggestion.id,
      status: "sent",
      userId: suggestion.userId,
    });
    await ctx.reply("Отмена отмены поста!😯");
    await ctx.reply(nextSuggestionText, getNextRefusedSuggestionKeyboard());
  } catch (error) {
    await errorHandler(ctx, error);
  }
});

refuseScene.action(RefuseKeyboard.UseDefaultPhrase, async (ctx) => {
  try {
    const suggestion = await getPreparedForRefuseSuggestion();
    await refuseSuggestion(suggestion, defaultText);
    await ctx.reply(nextSuggestionText, getNextRefusedSuggestionKeyboard());
  } catch (error) {
    await errorHandler(ctx, error);
  }
});

refuseScene.action(RefuseKeyboard.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Admin);
});

refuseScene.command("back", async (ctx) => {
  await ctx.scene.enter(SceneAlias.Admin);
});

refuseScene.command(DEFAULT_CODE_PHRASE, async (ctx) => {
  // set default code phrase
});

export default refuseScene;

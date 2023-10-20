import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { makeMessageToTg, makePostToTg } from "../../services/api/tgApi";
import {
  getSuggestionsByStatus,
  updateSuggestionInfo,
} from "../../services/suggestion";
import {
  getAdminKeyboard,
  getNextSuggestionKeyboard,
  getResolveSuggestionKeyboard,
} from "./utils";
import { chatLogger } from "../../utils/message";
import config from "../../config";

export enum MenuKeyboardAction {
  GetSuggestions = "GetSuggestions",
  GetPreparedForRefuseSuggestions = "GetSuggestions",
  Back = "Back",
}

export enum SuggestionKeyboardAction {
  Approve = "Approve",
  Refuse = "Refuse",
  ForRevision = "ForRevision",
}

const adminScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Admin);

adminScene.enter(async (ctx) => {
  await ctx.reply("admin menu 😎🤙🏻", getAdminKeyboard());
});

adminScene.action(MenuKeyboardAction.GetSuggestions, async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  const newSuggestions = await getSuggestionsByStatus("new");
  if (newSuggestions.length === 0) {
    await ctx.reply("В предложке пусто...");
    return;
  }

  const currentSuggestion = newSuggestions[0];

  await makePostToTg(
    { photos: currentSuggestion.fileIds, text: currentSuggestion.caption },
    String(chatId),
  );

  await ctx.reply("Норм?", getResolveSuggestionKeyboard());
});

adminScene.action(
  MenuKeyboardAction.GetPreparedForRefuseSuggestions,
  async (ctx) => {
    await ctx.scene.enter(SceneAlias.Refuse);
  },
);

adminScene.action(MenuKeyboardAction.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Menu);
});

adminScene.action(SuggestionKeyboardAction.Approve, async (ctx) => {
  try {
    const newSuggestions = await getSuggestionsByStatus("new");
    const approvedSuggestion = newSuggestions[0];
    updateSuggestionInfo({ status: "approved", userId: approvedSuggestion.userId });

    // post into public channel
    await makePostToTg(
      { photos: approvedSuggestion.fileIds, text: approvedSuggestion.caption },
      String(config.TG_GROUP_ID),
    );

    // send message to author with notification about post
    const userChatId = String(approvedSuggestion.userId);
    await makeMessageToTg({ chatId: userChatId, text: "Ваш пост опубликован!🎉" });
    await makePostToTg(
      { photos: approvedSuggestion.fileIds, text: approvedSuggestion.caption },
      userChatId,
    );

    updateSuggestionInfo({ status: "posted", userId: approvedSuggestion.userId });
    await ctx.reply("Пост одобрен и успешно выложен!");
    await ctx.reply("Показать следующий пост?", getNextSuggestionKeyboard());
  } catch (error) {
    await chatLogger(ctx, "Произошла ошибка...", error);
  }
});

adminScene.action(SuggestionKeyboardAction.Refuse, async (ctx) => {
  try {
    const newSuggestions = await getSuggestionsByStatus("new");
    const refusedSuggestion = newSuggestions[0];
    await updateSuggestionInfo({
      status: "preparedForRefuse",
      userId: refusedSuggestion.userId,
    });

    await ctx.scene.enter(SceneAlias.Refuse);
  } catch (error) {
    await chatLogger(ctx, "Произошла ошибка...", error);
  }
});

export default adminScene;

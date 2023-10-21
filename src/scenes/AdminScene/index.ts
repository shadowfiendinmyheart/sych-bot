import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { makeMessageToTg, makePostToTg } from "../../services/api/tgApi";
import { getSuggestionsByStatus, updateSuggestion } from "../../services/suggestion";
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
  const sentSuggestions = await getSuggestionsByStatus("sent");
  if (sentSuggestions.length === 0) {
    await ctx.reply("В предложке пусто...");
    return;
  }

  const currentSuggestion = sentSuggestions[0];

  await makePostToTg({
    post: { photos: currentSuggestion.fileIds, text: currentSuggestion.caption },
    chatId: String(chatId),
  });

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
    const sentSuggestions = await getSuggestionsByStatus("sent");
    const approvedSuggestion = sentSuggestions[0];
    updateSuggestion({
      id: approvedSuggestion.id,
      status: "approved",
      userId: approvedSuggestion.userId,
    });

    // post into public channel
    await makePostToTg({
      post: { photos: approvedSuggestion.fileIds, text: approvedSuggestion.caption },
    });

    // send message to author with notification about post
    const userChatId = String(approvedSuggestion.userId);
    await makeMessageToTg({ chatId: userChatId, text: "Ваш пост опубликован!🎉" });
    await makePostToTg({
      post: { photos: approvedSuggestion.fileIds, text: approvedSuggestion.caption },
      chatId: userChatId,
    });

    updateSuggestion({
      id: approvedSuggestion.id,
      status: "posted",
      userId: approvedSuggestion.userId,
    });
    await ctx.reply("Пост одобрен и успешно выложен!");
    await ctx.reply("Показать следующий пост?", getNextSuggestionKeyboard());
  } catch (error) {
    await chatLogger(ctx, "Произошла ошибка...", error);
  }
});

adminScene.action(SuggestionKeyboardAction.Refuse, async (ctx) => {
  try {
    const sentSuggestions = await getSuggestionsByStatus("sent");
    const refusedSuggestion = sentSuggestions[0];
    await updateSuggestion({
      id: refusedSuggestion.id,
      status: "preparedForRefuse",
      userId: refusedSuggestion.userId,
    });

    await ctx.scene.enter(SceneAlias.Refuse);
  } catch (error) {
    await chatLogger(ctx, "Произошла ошибка...", error);
  }
});

export default adminScene;

import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { makeMessageToTg, makePostToTg } from "../../services/api/tg/tgApi";
import { getSuggestionsByStatus, updateSuggestion } from "../../services/suggestion";
import {
  getAdminKeyboard,
  getNextSuggestionKeyboard,
  getResolveSuggestionKeyboard,
} from "./utils";
import { getPreparedForRefuseSuggestion } from "../RefuseScene/utils";
import { errorHandlerWithLogger } from "../utils";
import { ERRORS } from "../../const";
import { getLast30DaysStats } from "../../services/stats";

export enum MenuKeyboardAction {
  GetSuggestions = "GetSuggestions",
  GetPreparedForRefuseSuggestions = "GetPreparedForRefuseSuggestions",
  ShowAdminMenu = "ShowAdminMenu",
  GetLast30DaysStats = "GetLast30DaysStats",
  Back = "Back",
}

export enum SuggestionKeyboardAction {
  Approve = "Approve",
  Refuse = "Refuse",
  ForRevision = "ForRevision",
}

const adminScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Admin);

adminScene.enter(async (ctx) => {
  try {
    await ctx.reply("admin menu 😎🤙🏻", getAdminKeyboard());
  } catch (error) {
    await errorHandlerWithLogger({ ctx, error, about: "enter admin scene" });
    await ctx.scene.enter(SceneAlias.Menu);
  }
});

adminScene.action(MenuKeyboardAction.GetSuggestions, async (ctx) => {
  try {
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
  } catch (error) {
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "admin scene get suggestions",
    });
  }
});

adminScene.action(
  MenuKeyboardAction.GetPreparedForRefuseSuggestions,
  async (ctx) => {
    try {
      const suggestion = await getPreparedForRefuseSuggestion();
      if (!suggestion) throw Error(ERRORS.ADMIN_EMPTY_SUGGESTION);

      await ctx.scene.enter(SceneAlias.Refuse);
    } catch (error) {
      await errorHandlerWithLogger({
        ctx,
        error,
        about: "admin scene get prepared for refuse suggestion",
      });
    }
  },
);

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
    await errorHandlerWithLogger({ ctx, error, about: "admin scene approve" });
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

    await ctx.reply("Показать следующий пост?", getNextSuggestionKeyboard());
  } catch (error) {
    await errorHandlerWithLogger({ ctx, error, about: "admin scene refuse" });
  }
});

adminScene.action(MenuKeyboardAction.GetLast30DaysStats, async (ctx) => {
  const last30DaysStats = getLast30DaysStats();
  let formattedStats = "";
  let totalUniqueUsersIds = 0;
  last30DaysStats.forEach((dayWithUsers) => {
    const uniqueUsersIdsLength = dayWithUsers[1].length;
    formattedStats += `${dayWithUsers[0]}: ${uniqueUsersIdsLength}\n`;
    totalUniqueUsersIds += uniqueUsersIdsLength;
  });
  await ctx.reply(formattedStats);
  await ctx.reply(
    `Среднее ежедневное количество уникальных пользователей за последние 30 дней — ${(
      totalUniqueUsersIds / 30
    ).toFixed(2)}`,
  );
  await ctx.scene.reenter();
});

adminScene.action(MenuKeyboardAction.ShowAdminMenu, async (ctx) => {
  await ctx.scene.reenter();
});

adminScene.action(MenuKeyboardAction.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Menu);
});

export default adminScene;

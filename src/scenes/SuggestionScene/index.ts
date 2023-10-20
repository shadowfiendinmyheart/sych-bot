import { Scenes } from "telegraf";
import { getSuggestionKeyboard, KeyboardAction } from "./utils";
import { SceneAlias } from "../../types/scenes";
import { makePostToTg } from "../../services/api/tgApi";
import {
  checkSuggestionInfo,
  deleteSuggestionInfo,
  getSuggestionInfo,
  saveSuggestionInfo,
  updateSuggestionInfo,
} from "../../services/suggestion";
import { errorHandler } from "../utils";
import { Suggestion } from "../../types/suggestion";
import { getSuggestionStatusText } from "../../utils/suggestion";

const suggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.Suggestion,
);

const welcomeSceneText = "Выберите нужный пункт меню";

suggestionScene.enter(async (ctx) => {
  try {
    const userId = ctx.chat?.id || 0;
    const username = ctx.callbackQuery?.from.username || "";
    const isSuggestionExist = await checkSuggestionInfo(userId);
    if (!isSuggestionExist) {
      const initSuggestion: Suggestion = {
        fileIds: [],
        status: "draft",
        caption: "",
        createdAt: 0,
        userId,
        username,
      };
      await saveSuggestionInfo(initSuggestion);
      await ctx.reply(welcomeSceneText, getSuggestionKeyboard(initSuggestion));
      return;
    }

    const suggestion = await getSuggestionInfo(userId);
    await ctx.reply(welcomeSceneText, getSuggestionKeyboard(suggestion));
  } catch (error) {
    errorHandler(ctx, error);
    ctx.scene.enter(SceneAlias.Menu);
  }
});

// Назад
suggestionScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

// Показать предложку
// TODO не показывать опубликованные предложки
suggestionScene.action(KeyboardAction.Show, async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  const userId = ctx.update.callback_query.from.id;

  try {
    const suggestionInfo = await getSuggestionInfo(userId);
    if (suggestionInfo.fileIds.length === 0 && suggestionInfo.caption.length === 0) {
      await ctx.reply("Тут пусто... Сначала нужно добавить фотографии или описание");
      return;
    }

    await ctx.reply(
      `Статус вашей предложки — ${getSuggestionStatusText(suggestionInfo.status)}`,
    );
    await makePostToTg(
      { photos: suggestionInfo.fileIds, text: suggestionInfo.caption },
      String(chatId),
    );
    await ctx.reply(welcomeSceneText, getSuggestionKeyboard(suggestionInfo));
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Фотографии
suggestionScene.action(KeyboardAction.Photo, async (ctx) => {
  await ctx.scene.enter(SceneAlias.PhotoSuggestion);
});

// Описание
suggestionScene.action(KeyboardAction.Description, async (ctx) => {
  await ctx.scene.enter(SceneAlias.DescriptionSuggestion);
});

// Отправить
suggestionScene.action(KeyboardAction.Send, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const suggestion = await getSuggestionInfo(userId);

    if (suggestion.fileIds.length === 0) {
      await ctx.reply("Сначала нужно добавить фотографии");
      return;
    }

    if (suggestion.status === "new") {
      await ctx.reply("Предложка находится в обработке...");
      return;
    }

    await updateSuggestionInfo({ userId: userId, status: "new" });
    await ctx.reply("Предложка отправлена");
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Отменить отправку
suggestionScene.action(KeyboardAction.ToDraft, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const suggestion = await getSuggestionInfo(userId);

    if (suggestion.status !== "new") {
      await ctx.reply("Неверный статус предложки");
      return;
    }

    await updateSuggestionInfo({ userId: userId, status: "draft" });
    await ctx.reply("Предложка возвращена");
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Удалить
suggestionScene.action(KeyboardAction.Delete, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    await deleteSuggestionInfo(userId);
    await ctx.reply("Предложка удалена");
  } catch (error) {
    errorHandler(ctx, error);
  }
});

suggestionScene.on("text", async (ctx) => {
  await ctx.reply(
    'Неизвестная команда, чтобы выйти в меню предложки воспользуйтесь командой "Назад"',
  );
});

export default suggestionScene;

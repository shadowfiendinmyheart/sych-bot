import { Scenes } from "telegraf";
import { makePostToTg, makeMessageToTg } from "../../services/api/tgApi";
import {
  deleteSuggestion,
  getUserActiveSuggestion,
  getUserDraftSuggestion,
  saveSuggestion,
  updateSuggestion,
} from "../../services/suggestion";
import { errorHandler } from "../utils";
import { Suggestion } from "../../types/suggestion";
import {
  generateSuggestionWithInitialFields,
  getSuggestionStatusText,
} from "../../utils/suggestion";
import { getSuggestionKeyboard, KeyboardAction } from "./utils";
import { SceneAlias } from "../../types/scenes";
import { ERRORS } from "../../const";

const suggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.Suggestion,
);

const welcomeSceneText = "Выберите нужный пункт меню";

suggestionScene.enter(async (ctx) => {
  try {
    const userId = ctx.chat?.id || 0;
    const username = ctx.callbackQuery?.from.username || "";
    const activeSuggestion = await getUserActiveSuggestion(userId);
    if (!activeSuggestion) {
      const initSuggestion: Suggestion = generateSuggestionWithInitialFields({
        userId,
        username,
      });
      await saveSuggestion(initSuggestion);
      await ctx.reply(welcomeSceneText, getSuggestionKeyboard(initSuggestion));
      return;
    }

    await ctx.reply(welcomeSceneText, getSuggestionKeyboard(activeSuggestion));
  } catch (error) {
    await errorHandler(ctx, error);
    ctx.scene.enter(SceneAlias.Menu);
  }
});

// Назад
suggestionScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

// Показать предложку
suggestionScene.action(KeyboardAction.Show, async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  const userId = ctx.update.callback_query.from.id;

  try {
    const activeSuggestion = await getUserActiveSuggestion(userId);

    if (!activeSuggestion) throw Error(ERRORS.EMPTY_SUGGESTION);

    if (
      activeSuggestion.fileIds.length === 0 &&
      activeSuggestion.caption.length === 0
    ) {
      await ctx.reply("Тут пусто... Сначала нужно добавить фотографии или описание");
      return;
    }

    await ctx.reply(
      `Статус вашей предложки — ${getSuggestionStatusText(activeSuggestion.status)}`,
    );
    if (activeSuggestion.fileIds.length > 0) {
      await makePostToTg({
        post: { photos: activeSuggestion.fileIds, text: activeSuggestion.caption },
        chatId: String(chatId),
      });
    } else {
      await makeMessageToTg({
        text: activeSuggestion.caption,
        chatId: String(chatId),
      });
    }
    await ctx.reply(welcomeSceneText, getSuggestionKeyboard(activeSuggestion));
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Добавить фотографии
suggestionScene.action(KeyboardAction.Photo, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const draftSuggestions = await getUserDraftSuggestion(userId);
    if (!draftSuggestions) throw Error(ERRORS.WRONG_STATUS_SUGGESTION);

    await ctx.scene.enter(SceneAlias.PhotoSuggestion);
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Добавить описание
suggestionScene.action(KeyboardAction.Description, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const draftSuggestions = await getUserDraftSuggestion(userId);
    if (!draftSuggestions) throw Error(ERRORS.WRONG_STATUS_SUGGESTION);

    await ctx.scene.enter(SceneAlias.DescriptionSuggestion);
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Отправить
suggestionScene.action(KeyboardAction.Send, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const draftSuggestions = await getUserDraftSuggestion(userId);

    if (!draftSuggestions) throw Error(ERRORS.WRONG_STATUS_SUGGESTION);

    if (draftSuggestions.fileIds.length === 0) {
      await ctx.reply("Сначала нужно добавить фотографии");
      return;
    }

    if (draftSuggestions.status === "sent") {
      await ctx.reply("Предложка находится в обработке...");
      return;
    }

    const updatedSuggestion = await updateSuggestion({
      id: draftSuggestions.id,
      userId: userId,
      status: "sent",
    });
    if (!updatedSuggestion) throw Error(ERRORS.SAVE_SUGGESTION);
    await ctx.editMessageText(
      "Предложка отправлена",
      getSuggestionKeyboard(updatedSuggestion),
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Отменить отправку
suggestionScene.action(KeyboardAction.ToDraft, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const activeSuggestion = await getUserActiveSuggestion(userId);

    if (!activeSuggestion) throw Error(ERRORS.EMPTY_SUGGESTION);

    if (activeSuggestion.status !== "sent") {
      await ctx.reply("Неверный статус предложки");
      return;
    }

    const updatedSuggestion = await updateSuggestion({
      id: activeSuggestion.id,
      userId: userId,
      status: "draft",
    });
    if (!updatedSuggestion) throw Error(ERRORS.WRONG_STATUS_SUGGESTION);
    await ctx.editMessageText(
      "Предложка возвращена",
      getSuggestionKeyboard(updatedSuggestion),
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Удалить
suggestionScene.action(KeyboardAction.Delete, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const username = ctx.callbackQuery?.from.username || "";
    const draftSuggestion = await getUserDraftSuggestion(userId);
    if (!draftSuggestion) throw Error(ERRORS.WRONG_STATUS_SUGGESTION);
    await deleteSuggestion(draftSuggestion.id);

    const initSuggestion: Suggestion = generateSuggestionWithInitialFields({
      userId,
      username,
    });
    await saveSuggestion(initSuggestion);
    await ctx.editMessageText(
      welcomeSceneText,
      getSuggestionKeyboard(initSuggestion),
    );
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

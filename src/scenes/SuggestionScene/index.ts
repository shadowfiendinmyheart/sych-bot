import { Scenes } from "telegraf";
import { makePostToTg, makeMessageToTg } from "../../services/api/tg/tgApi";
import {
  deleteSuggestion,
  getUserActiveSuggestion,
  getUserDraftSuggestion,
  saveSuggestion,
  updateSuggestion,
} from "../../services/suggestion";
import { errorHandlerWithLogger } from "../utils";
import { Suggestion } from "../../types/suggestion";
import {
  generateSuggestionWithInitialFields,
  getSuggestionStatusForUsersText,
} from "../../utils/suggestion";
import {
  getSuggestionKeyboard,
  helpHtmlSuggestionScene,
  KeyboardAction,
  notifyAdminsAboutSuggestion,
} from "./utils";
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
    await errorHandlerWithLogger({ ctx, error, about: "suggestion scene enter" });
    ctx.scene.enter(SceneAlias.Menu);
  }
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
      `Статус вашей предложки — ${getSuggestionStatusForUsersText(
        activeSuggestion.status,
      )}`,
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
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "suggestion scene show suggestion",
    });
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
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "suggestion scene enter photo scene",
    });
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
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "suggestion scene enter description scene",
    });
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

    await notifyAdminsAboutSuggestion(updatedSuggestion, "Новая предложка!");
  } catch (error) {
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "suggestion scene send suggestion",
    });
  }
});

// Отменить отправку
suggestionScene.action(KeyboardAction.ToDraft, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const activeSuggestion = await getUserActiveSuggestion(userId);
    if (!activeSuggestion) throw Error(ERRORS.WRONG_STATUS_SUGGESTION);

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

    await notifyAdminsAboutSuggestion(updatedSuggestion, "Предложку отменили...");
  } catch (error) {
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "suggestion scene to draft suggestion",
    });
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
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "suggestion scene delete suggestion",
    });
  }
});

// Помощь
suggestionScene.action(KeyboardAction.Help, async (ctx) => {
  try {
    const userId = ctx.chat?.id || 0;
    const activeSuggestion = await getUserActiveSuggestion(userId);
    if (!activeSuggestion) throw ERRORS.EMPTY_SUGGESTION;
    await ctx.replyWithHTML(helpHtmlSuggestionScene);
    await ctx.reply(welcomeSceneText, getSuggestionKeyboard(activeSuggestion));
  } catch (error) {
    errorHandlerWithLogger({ ctx, error, about: "suggestion scene help" });
  }
});

// Назад
suggestionScene.action(KeyboardAction.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Menu);
});

export default suggestionScene;

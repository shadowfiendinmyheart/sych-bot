import { Scenes } from "telegraf";
import { makePostToTg, makeMessageToTg } from "../../services/api/tgApi";
import {
  deleteSuggestion,
  getSuggestionsByUserId,
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
    const draftSuggestions = await getUserDraftSuggestion(userId);

    if (!draftSuggestions) throw Error(ERRORS.EMPTY_SUGGESTION);

    if (draftSuggestions.fileIds.length === 0) {
      await ctx.reply("Сначала нужно добавить фотографии");
      return;
    }

    if (draftSuggestions.status === "sent") {
      await ctx.reply("Предложка находится в обработке...");
      return;
    }

    await updateSuggestion({
      id: draftSuggestions.id,
      userId: userId,
      status: "sent",
    });
    await ctx.reply("Предложка отправлена");
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

    await updateSuggestion({
      id: activeSuggestion.id,
      userId: userId,
      status: "draft",
    });
    await ctx.reply("Предложка возвращена");
  } catch (error) {
    errorHandler(ctx, error);
  }
});

// Удалить
suggestionScene.action(KeyboardAction.Delete, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const activeSuggestion = await getUserActiveSuggestion(userId);
    if (!activeSuggestion) throw Error(ERRORS.EMPTY_SUGGESTION);
    await deleteSuggestion(activeSuggestion.id);
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

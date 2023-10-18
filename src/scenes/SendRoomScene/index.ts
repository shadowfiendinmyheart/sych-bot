import { Scenes } from "telegraf";
import { getSendRoomKeyboard, KeyboardAction } from "./utils";
import { SceneAlias } from "../../types/scenes";
import { makePostToTg } from "../../services/api/tgApi";
import {
  checkSuggestionInfo,
  deleteSuggestionInfo,
  getSuggestionInfo,
  saveSuggestionInfo,
  updateSuggestionInfo,
} from "../../services/suggestion";
import { userErrorHanlder } from "../utils";

const sendRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.SendRoom);

const welcomeSceneText = "Выберите нужный пункт меню";

sendRoomScene.enter(async (ctx) => {
  try {
    await ctx.reply(welcomeSceneText, getSendRoomKeyboard());

    const userId = ctx.callbackQuery?.from.id || 0;
    const username = ctx.callbackQuery?.from.username || "";
    const isSuggestionExist = await checkSuggestionInfo(userId);
    if (!isSuggestionExist) {
      await saveSuggestionInfo({
        fileIds: [],
        status: "draft",
        caption: "",
        createdAt: 0,
        userId,
        username,
      });
    }
  } catch (error) {
    userErrorHanlder(ctx, error);
    ctx.scene.enter(SceneAlias.Menu);
  }
});

// Назад
sendRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

// Показать предложку
// TODO не показывать опубликованные предложки
sendRoomScene.action(KeyboardAction.Show, async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  const userId = ctx.update.callback_query.from.id;

  try {
    const suggestionInfo = await getSuggestionInfo(userId);
    await ctx.reply(`Ваша предложка:`);
    if (suggestionInfo.fileIds.length === 0 && suggestionInfo.caption.length === 0) {
      await ctx.reply("Тут пусто... Сначала нужно добавить фотографии или описание");
      return;
    }

    await makePostToTg(
      { photos: suggestionInfo.fileIds, text: suggestionInfo.caption },
      String(chatId),
    );
    await ctx.reply(welcomeSceneText, getSendRoomKeyboard());
  } catch (error) {
    userErrorHanlder(ctx, error);
  }
});

// Фотографии
sendRoomScene.action(KeyboardAction.Photo, async (ctx) => {
  await ctx.scene.enter(SceneAlias.PhotoSuggestion);
});

// Описание
sendRoomScene.action(KeyboardAction.Description, async (ctx) => {
  await ctx.scene.enter(SceneAlias.DescriptionSuggestion);
});

// Отправить
sendRoomScene.action(KeyboardAction.Send, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    const suggestion = await getSuggestionInfo(userId);

    if (suggestion.fileIds.length === 0) {
      await ctx.reply("Сначала нужно добавить фотографии");
      return;
    }

    const isSended = suggestion.status === "new";
    if (isSended) {
      await ctx.reply("Предложка находится в обработке...");
      return;
    }

    await updateSuggestionInfo({ userId: userId, status: "new" });
    await ctx.reply("Предложка отправлена");
  } catch (error) {
    userErrorHanlder(ctx, error);
  }
});

// Удалить
sendRoomScene.action(KeyboardAction.Delete, async (ctx) => {
  try {
    const userId = ctx.from?.id || 0;
    await deleteSuggestionInfo(userId);
    await ctx.reply("Предложка удалена");
  } catch (error) {
    userErrorHanlder(ctx, error);
  }
});

sendRoomScene.on("text", async (ctx) => {
  await ctx.reply(
    'Неизвестная команда, чтобы выйти в меню предложки воспользуйтесь командой "Назад"',
  );
});

export default sendRoomScene;

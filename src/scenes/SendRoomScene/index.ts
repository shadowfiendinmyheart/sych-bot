import { Scenes } from "telegraf";
import {
  getSuggestionInfo,
  getSendRoomKeyboard,
  KeyboardAction,
  updateSuggestionInfo,
} from "./utils";
import { SceneAlias } from "../../types/scenes";
import { makePostToTg } from "../ReposterScene/tgApi";
import { userErrorHanlder } from "../utils";

const sendRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.SendRoom);

const welcomeSceneText = "Выберите нужный пункт меню";

sendRoomScene.enter(async (ctx) => {
  await ctx.reply(welcomeSceneText, getSendRoomKeyboard());
});

// Назад
sendRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

// Показать предложку
sendRoomScene.action(KeyboardAction.Show, async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  const userId = ctx.update.callback_query.from.id;

  try {
    const suggestionInfo = await getSuggestionInfo(userId);
    await ctx.reply(`Ваша предложка:`);
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
  const userId = ctx.from?.id || 0;
  updateSuggestionInfo({ userId: userId, status: "new" });
  await ctx.reply("Отправить");
});

sendRoomScene.on("text", async (ctx) => {
  await ctx.reply(
    'Неизвестная команда, чтобы выйти в меню предложки воспользуйтесь командой "Назад"',
  );
});

export default sendRoomScene;

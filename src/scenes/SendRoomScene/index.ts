import * as fs from "fs";
import { Scenes } from "telegraf";

import {
  changeSuggestionStatus,
  getSuggestionInfo,
  getSuggestionMediaGroupPost,
  savePostInFolder,
  saveSuggestionInfo,
  getSendRoomKeyboard,
} from "./utils";

import { SceneAlias } from "../../types/scenes";
import { suggestionFolderPath } from "../../const";

export enum KeyboardAction {
  Back = "Menu",
  Send = "Send",
  Delete = "Delete",
}

const sendRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.SendRoom
);

const welcomeSceneText =
  "Отправьте сообщение с фотографиями вашей сычевальни, по желанию можете добавить к вашей записи текст :)";
sendRoomScene.enter(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply(
      "Произошла ошибка, попробуйте позже, или обратитесь к администратору"
    );
    ctx.scene.enter(SceneAlias.Menu);
    return;
  }
  const userDirectory = `${suggestionFolderPath}/${userId}`;

  if (!fs.existsSync(userDirectory)) {
    fs.mkdirSync(userDirectory);
    await ctx.reply(welcomeSceneText, getSendRoomKeyboard());
    return;
  }

  const mediaGroupPost = await getSuggestionMediaGroupPost(userId);
  if (!mediaGroupPost) {
    await ctx.reply(welcomeSceneText, getSendRoomKeyboard());
    return;
  }

  await ctx.reply("Ваша предложка:");
  await ctx.replyWithMediaGroup(mediaGroupPost);
});

// Назад
sendRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

// Отправить
sendRoomScene.action(KeyboardAction.Send, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply(
      "Произошла ошибка, попробуйте позже, или обратитесь к администратору"
    );
    ctx.scene.enter(SceneAlias.Menu);
    return;
  }
  await changeSuggestionStatus(userId, "active");
  await ctx.reply("Предложка успешно отправлена");
  ctx.scene.enter(SceneAlias.Menu);
});

// Вызывается на каждую фотку
sendRoomScene.on("photo", async (ctx) => {
  const photos = ctx.message.photo;
  const caption = ctx.message.caption;
  const userId = ctx.message.from.id;
  const username =
    ctx.update.message.from.username ||
    ctx.update.message.from.first_name + ctx.update.message.from.last_name;

  const fileId = photos[3].file_id;

  const userDirectory = `${suggestionFolderPath}/${userId}`;

  const { href } = await ctx.telegram.getFileLink(fileId);

  try {
    await savePostInFolder(href, userDirectory, fileId);
    const existedSuggestionInfo = await getSuggestionInfo(userId);
    await saveSuggestionInfo({
      fileIds: [...existedSuggestionInfo.fileIds, fileId],
      status: "new",
      caption: caption || "",
      user_id: userId,
      username: username,
    });
  } catch (error) {
    await ctx.reply("Произошла ошибка на сервере... Попробуйте позже");
    console.log("---");
    console.log("save suggestion error", error);
    console.log("message", ctx.message);
    console.log("---");
    await ctx.scene.enter(SceneAlias.Menu);
  }
});

export default sendRoomScene;

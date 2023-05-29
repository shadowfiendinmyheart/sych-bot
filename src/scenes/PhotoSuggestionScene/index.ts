import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import {
  getSuggestionInfo,
  saveSuggestionInfo,
  updateSuggestionInfo,
} from "../SendRoomScene/utils";
import { userErrorHanlder } from "../utils";

enum PhotoKeyboard {
  Done = "Готово",
  Delete = "Удалить все фото",
  Back = "Назад",
}

const MAX_PHOTO_NUMBER = 9;

const photoSuggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.PhotoSuggestion,
);

photoSuggestionScene.enter(async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  ctx.telegram.sendMessage(chatId, `Отправьте не более ${MAX_PHOTO_NUMBER} фото`, {
    reply_markup: {
      keyboard: [[{ text: PhotoKeyboard.Delete }, { text: PhotoKeyboard.Back }]],
      one_time_keyboard: true,
      // remove_keyboard: true
    },
  });
});

// Вызывается на каждую фотку
photoSuggestionScene.on("photo", async (ctx) => {
  const photos = ctx.message.photo;
  const bestSizeFile = photos[3];
  const caption = ctx.message.caption;
  const userId = ctx.message.from.id;
  const username =
    ctx.update.message.from.username ||
    ctx.update.message.from.first_name + ctx.update.message.from.last_name;

  const bestSizeFileId = bestSizeFile.file_id;

  try {
    const existedSuggestionInfo = await getSuggestionInfo(userId);

    if (existedSuggestionInfo?.fileIds?.length > 9) {
      await ctx.reply(`Превышен лимит в ${MAX_PHOTO_NUMBER} фото`);
      return;
    }

    if (!existedSuggestionInfo) {
      await saveSuggestionInfo({
        fileIds: [bestSizeFileId],
        status: "draft",
        caption: caption || "",
        userId,
        username,
      });
      return;
    }

    await updateSuggestionInfo({
      userId,
      fileIds: [...existedSuggestionInfo.fileIds, bestSizeFileId],
    });
    await ctx.reply(`Фотография номер ${existedSuggestionInfo.fileIds.length + 1} успешно сохранена`)
  } catch (error) {
    await userErrorHanlder(ctx, error);
  }
});

photoSuggestionScene.on("text", async (ctx) => {
  const userId = ctx.message.from.id;
  const text = ctx.message.text;

  if (text === PhotoKeyboard.Delete) {
    await updateSuggestionInfo({ userId, fileIds: [] });
    await ctx.reply("Фотографии удалены");
    await ctx.scene.enter(SceneAlias.SendRoom);
    return;
  }

  if (text === PhotoKeyboard.Back) {
    await ctx.scene.enter(SceneAlias.SendRoom);
    return;
  }
});

export default photoSuggestionScene;

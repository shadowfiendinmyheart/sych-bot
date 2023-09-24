import { Scenes } from "telegraf";
import {
  checkSuggestionInfo,
  getSuggestionInfo,
  saveSuggestionInfo,
  updateSuggestionInfo,
} from "../../services/suggestion";
import debounce from "../../utils/debounce";

import { SceneAlias } from "../../types/scenes";
import { userErrorHanlder } from "../utils";

enum PhotoKeyboard {
  Done = "Готово",
  Delete = "Удалить все фото",
  Back = "Назад",
}

const MAX_PHOTO_NUMBER = 9;

const userPhotos: Record<string, string[]> = {};

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
  const userId = ctx.message.from.id;
  const photos = ctx.message.photo;
  const bestSizeFile = photos[3];
  const bestSizeFileId = bestSizeFile.file_id;

  const uploadPhoto = async (photoIds: string[]) => {
    const caption = ctx.message.caption;
    const username =
      ctx.update.message.from.username ||
      ctx.update.message.from.first_name + ctx.update.message.from.last_name;
  
    try {
      const existedSuggestionInfo = await getSuggestionInfo(userId);
  
      const isSuggestionExist = await checkSuggestionInfo(userId);
      if (!isSuggestionExist) {
        await saveSuggestionInfo({
          fileIds: [],
          status: "draft",
          caption: caption || "",
          userId,
          username,
        });
      }
  
      if (existedSuggestionInfo?.fileIds?.length > 9) {
        await ctx.reply(`Превышен лимит в ${MAX_PHOTO_NUMBER} фото`);
        return;
      }
  
      await updateSuggestionInfo({
        userId,
        fileIds: [...existedSuggestionInfo.fileIds, ...photoIds],
      });
      await ctx.reply(
        `Фотография номер ${
          existedSuggestionInfo.fileIds.length + 1
        } успешно сохранена`,
      );
    } catch (error) {
      await userErrorHanlder(ctx, error);
    }
  }

  userPhotos[String(userId)] = [...(userPhotos[String(userId)] || []), bestSizeFileId];
  debounce(uploadPhoto, 1000)(userPhotos[String(userId)]);
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

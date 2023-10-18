import { Scenes } from "telegraf";
import { updateSuggestionInfo } from "../../services/suggestion";
import debounce from "../../utils/debounce";

import { SceneAlias } from "../../types/scenes";
import { uploadPhoto, userPhotosBuffer } from "./utils";

enum PhotoKeyboard {
  Done = "Готово",
  Delete = "Удалить все фото",
  Back = "Назад",
}

export const MAX_PHOTO_NUMBER = 9;

const photoSuggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.PhotoSuggestion,
);

photoSuggestionScene.enter(async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  ctx.telegram.sendMessage(chatId, `Отправьте не более ${MAX_PHOTO_NUMBER} фото`, {
    reply_markup: {
      keyboard: [[{ text: PhotoKeyboard.Delete }, { text: PhotoKeyboard.Back }]],
      one_time_keyboard: true,
      remove_keyboard: true,
    },
  });
});

const debouncedUploadPhoto = debounce(uploadPhoto, 2000);
// Вызывается на каждую фотку
photoSuggestionScene.on("photo", async (ctx) => {
  const userId = ctx.message.from.id;
  const photos = ctx.message.photo;
  const bestSizeFile = photos[photos.length - 1];
  const bestSizeFileId = bestSizeFile.file_id;
  let userPhotos = userPhotosBuffer[String(userId)] || [];

  userPhotos.push(bestSizeFileId);
  userPhotosBuffer[String(userId)] = userPhotos;
  debouncedUploadPhoto(ctx, userId, userPhotos);
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

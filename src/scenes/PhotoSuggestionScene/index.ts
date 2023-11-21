import { Scenes } from "telegraf";
import { getUserDraftSuggestion, updateSuggestion } from "../../services/suggestion";
import debounce from "../../utils/debounce";

import { SceneAlias } from "../../types/scenes";
import {
  getPhotoSuggestionKeyboard,
  getTextWithPhotoSuggestionHint,
  uploadPhoto,
  userPhotosBuffer,
} from "./utils";
import { ERRORS } from "../../const";
import { errorHandler } from "../utils";

export enum PhotoSuggestionKeyboard {
  Delete = "Удалить",
  Back = "Назад",
}

export const MAX_PHOTO_NUMBER = 9;

const photoSuggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.PhotoSuggestion,
);

photoSuggestionScene.enter(async (ctx) => {
  try {
    const userId = ctx.chat?.id || 0;
    const draftSuggestion = await getUserDraftSuggestion(userId);
    if (!draftSuggestion) throw ERRORS.EMPTY_SUGGESTION;

    await ctx.reply(
      getTextWithPhotoSuggestionHint(
        `Максимальное количество фотографий для предложки — ${MAX_PHOTO_NUMBER}`,
        draftSuggestion,
      ),
      getPhotoSuggestionKeyboard(draftSuggestion),
    );
  } catch (error) {
    await errorHandler(ctx, error);
    await ctx.scene.enter(SceneAlias.Suggestion);
  }
});

const debouncedUploadPhoto = debounce(uploadPhoto, 2000);
// Вызывается на каждую фотку
photoSuggestionScene.on("photo", async (ctx) => {
  const userId = ctx.message.from.id;
  const photos = ctx.message.photo;
  const bestSizeFile = photos[photos.length - 1];
  const bestSizeFileId = bestSizeFile.file_id;
  const userPhotos = userPhotosBuffer[String(userId)] || [];

  userPhotos.push(bestSizeFileId);
  userPhotosBuffer[String(userId)] = userPhotos;
  debouncedUploadPhoto(ctx, userId, userPhotos);
});

photoSuggestionScene.on("text", async (ctx) => {
  try {
    const userId = ctx.message.from.id;
    const draftSuggestion = await getUserDraftSuggestion(userId);

    if (!draftSuggestion) throw Error(ERRORS.EMPTY_SUGGESTION);

    const text = ctx.message.text;

    if (text === PhotoSuggestionKeyboard.Back) {
      await ctx.scene.enter(SceneAlias.Suggestion);
      return;
    }

    if (text === PhotoSuggestionKeyboard.Delete) {
      if (draftSuggestion.fileIds.length === 0) {
        await ctx.reply("К вашей предложке не прикреплено ни одной фотографии");
        return;
      }
      const updatedSuggestion = await updateSuggestion({
        id: draftSuggestion.id,
        fileIds: [],
      });
      if (!updatedSuggestion) throw ERRORS.SAVE_SUGGESTION;
      await ctx.reply(
        getTextWithPhotoSuggestionHint("Фотографии удалены", updatedSuggestion),
        getPhotoSuggestionKeyboard(updatedSuggestion),
      );
      return;
    }

    await ctx.reply("Неизвестная команда...");
  } catch (error) {
    await errorHandler(ctx, error);
    await ctx.scene.enter(SceneAlias.Suggestion);
  }
});

export default photoSuggestionScene;

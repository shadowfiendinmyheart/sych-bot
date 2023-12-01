import { Markup } from "telegraf";
import { MAX_PHOTO_NUMBER, PhotoSuggestionKeyboard } from ".";
import { ERRORS } from "../../const";
import {
  getUserDraftSuggestion,
  saveSuggestion,
  updateSuggestion,
} from "../../services/suggestion";
import { Suggestion } from "../../types/suggestion";
import { generateSuggestionWithInitialFields } from "../../utils/suggestion";
import { errorHandlerWithLogger } from "../utils";

export const getIsAllowPhotoDelete = (suggestion: Suggestion) =>
  suggestion.fileIds.length > 0;

export const getTextWithPhotoSuggestionHint = (
  text: string,
  suggestion: Suggestion,
) =>
  `${text}\nВведите 'Назад', чтобы вернуться в предыдущее меню ${
    getIsAllowPhotoDelete(suggestion)
      ? `\nВведите 'Удалить', если хотите удалить ${
          suggestion.fileIds.length === 1
            ? "текущую фотографию"
            : "текущие фотографии"
        }`
      : ""
  }`;

export const getPhotoSuggestionKeyboard = (suggestion: Suggestion) => {
  const buttons = [];
  if (getIsAllowPhotoDelete(suggestion)) {
    buttons.push({ text: PhotoSuggestionKeyboard.Delete });
  }
  buttons.push({
    text: PhotoSuggestionKeyboard.Back,
  });

  return Markup.keyboard([buttons]).oneTime().resize();
};

export const userPhotosBuffer: Record<string, string[]> = {};
export const uploadPhoto = async (ctx: any, userId: number, photoIds: string[]) => {
  const caption = ctx.message.caption;
  const username =
    ctx.update.message.from.username ||
    ctx.update.message.from.first_name + ctx.update.message.from.last_name;

  try {
    let draftSuggestion = await getUserDraftSuggestion(userId);
    if (!draftSuggestion) {
      const initSuggestion = generateSuggestionWithInitialFields({
        caption,
        username,
        userId,
      });
      await saveSuggestion(initSuggestion);
      draftSuggestion = initSuggestion;
    }

    const totalPhotoLength = draftSuggestion?.fileIds?.length + photoIds.length;
    if (totalPhotoLength > MAX_PHOTO_NUMBER) {
      await ctx.reply(`Превышен лимит в ${MAX_PHOTO_NUMBER} фото`);
      return;
    }

    const updatedSuggestion = await updateSuggestion({
      id: draftSuggestion.id,
      fileIds: [...draftSuggestion.fileIds, ...photoIds],
    });
    if (!updatedSuggestion) throw ERRORS.SAVE_SUGGESTION;

    const photosLength = userPhotosBuffer[String(userId)].length;
    await ctx.reply(
      getTextWithPhotoSuggestionHint(
        photosLength > 1 ? `Ваши фотографии сохранены` : "Ваша фотография сохранена",
        updatedSuggestion,
      ),
      getPhotoSuggestionKeyboard(updatedSuggestion),
    );
  } catch (error) {
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "photo suggestion scene upload photo",
    });
  } finally {
    delete userPhotosBuffer[String(userId)];
  }
};

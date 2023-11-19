import { MAX_PHOTO_NUMBER } from ".";
import {
  getUserDraftSuggestion,
  saveSuggestion,
  updateSuggestion,
} from "../../services/suggestion";
import { generateSuggestionWithInitialFields } from "../../utils/suggestion";
import { errorHandler } from "../utils";

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

    await updateSuggestion({
      id: draftSuggestion.id,
      fileIds: [...draftSuggestion.fileIds, ...photoIds],
    });
    const photosLength = userPhotosBuffer[String(userId)].length;
    await ctx.reply(
      photosLength > 1 ? `Ваши фотографии сохранены` : "Ваша фотография сохранена",
    );
  } catch (error) {
    await errorHandler(ctx, error);
  } finally {
    delete userPhotosBuffer[String(userId)];
  }
};

import { MAX_PHOTO_NUMBER } from ".";
import {
  checkSuggestionInfo,
  getSuggestionInfo,
  saveSuggestionInfo,
  updateSuggestionInfo,
} from "../../services/suggestion";
import { errorHanlder } from "../utils";

export const userPhotosBuffer: Record<string, string[]> = {};

export const uploadPhoto = async (ctx: any, userId: number, photoIds: string[]) => {
  const caption = ctx.message.caption;
  const username =
    ctx.update.message.from.username ||
    ctx.update.message.from.first_name + ctx.update.message.from.last_name;

  try {
    const isSuggestionExist = await checkSuggestionInfo(userId);
    if (!isSuggestionExist) {
      await saveSuggestionInfo({
        fileIds: [],
        status: "draft",
        caption: caption || "",
        username,
        userId,
        createdAt: Date.now(),
      });
    }

    const existedSuggestionInfo = await getSuggestionInfo(userId);
    if (existedSuggestionInfo?.fileIds?.length > MAX_PHOTO_NUMBER) {
      await ctx.reply(`Превышен лимит в ${MAX_PHOTO_NUMBER} фото`);
      return;
    }

    await updateSuggestionInfo({
      userId,
      fileIds: [...existedSuggestionInfo.fileIds, ...photoIds],
    });
    const photosLength = userPhotosBuffer[String(userId)].length;
    await ctx.reply(
      photosLength > 1 ? `Ваши фотографии сохранены` : "Ваша фотография сохранена",
    );
  } catch (error) {
    await errorHanlder(ctx, error);
  } finally {
    delete userPhotosBuffer[String(userId)];
  }
};

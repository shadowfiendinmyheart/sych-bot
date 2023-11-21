import { Markup, Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { ERRORS, MAX_TG_MESSAGE_LENGTH } from "../../const";
import { errorHandler } from "../utils";
import { getUserDraftSuggestion, updateSuggestion } from "../../services/suggestion";
import {
  getDescriptionSuggestionKeyboard,
  getTextWithDescriptionSuggestionHint,
} from "./utils";

export enum DescriptionKeyboard {
  Delete = "Удалить",
  Back = "Назад",
}

const descriptionSuggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.DescriptionSuggestion,
);

descriptionSuggestionScene.enter(async (ctx) => {
  try {
    const userId = ctx.chat?.id || 0;
    const draftSuggestion = await getUserDraftSuggestion(userId);
    if (!draftSuggestion) throw ERRORS.EMPTY_SUGGESTION;

    await ctx.reply(
      getTextWithDescriptionSuggestionHint(
        `Отправьте не более ${MAX_TG_MESSAGE_LENGTH} символов`,
        draftSuggestion,
      ),
      getDescriptionSuggestionKeyboard(draftSuggestion),
    );
  } catch (error) {
    await errorHandler(ctx, error);
    await ctx.scene.enter(SceneAlias.Suggestion);
  }
});

descriptionSuggestionScene.on("text", async (ctx) => {
  const userId = ctx.message.from.id;
  const text = ctx.message.text;

  try {
    const draftSuggestion = await getUserDraftSuggestion(userId);
    if (!draftSuggestion) throw Error(ERRORS.EMPTY_SUGGESTION);
    if (text === DescriptionKeyboard.Delete) {
      if (!draftSuggestion.caption) {
        await ctx.reply("У вашей предложки пока нет описания...");
      }
      const updatedSuggestion = await updateSuggestion({
        id: draftSuggestion.id,
        caption: "",
      });
      if (!updatedSuggestion) throw ERRORS.SAVE_SUGGESTION;

      await ctx.reply(
        getTextWithDescriptionSuggestionHint("Описание удалено", updatedSuggestion),
        getDescriptionSuggestionKeyboard(updatedSuggestion),
      );
      return;
    }

    if (text === DescriptionKeyboard.Back) {
      await ctx.scene.enter(SceneAlias.Suggestion);
      return;
    }

    if (text.length > MAX_TG_MESSAGE_LENGTH) {
      await ctx.reply("Слишком длинное описание, попробуй короче");
      return;
    }

    const updatedSuggestion = await updateSuggestion({
      id: draftSuggestion.id,
      caption: text,
    });
    if (!updatedSuggestion) throw ERRORS.SAVE_SUGGESTION;
    await ctx.reply(
      getTextWithDescriptionSuggestionHint(
        "Описание успешно сохранено.\nЕсли хотите его изменить, просто отправьте сообщение ещё раз",
        updatedSuggestion,
      ),
      getDescriptionSuggestionKeyboard(updatedSuggestion),
    );
  } catch (error) {
    await errorHandler(ctx, error);
    await ctx.scene.enter(SceneAlias.Suggestion);
  }
});

export default descriptionSuggestionScene;

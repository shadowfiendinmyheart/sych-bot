import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { ERRORS, MAX_TG_MESSAGE_LENGTH } from "../../const";
import { errorHandler } from "../utils";
import {
  getSuggestionsByUserId,
  getUserDraftSuggestion,
  updateSuggestion,
} from "../../services/suggestion";

enum DescriptionKeyboard {
  Done = "Готово",
  Delete = "Удалить",
  Back = "Назад",
}

const descriptionSuggestionScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.DescriptionSuggestion,
);

descriptionSuggestionScene.enter(async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  ctx.telegram.sendMessage(
    chatId,
    `Отправьте не более ${MAX_TG_MESSAGE_LENGTH} символов`,
    {
      reply_markup: {
        keyboard: [
          [{ text: DescriptionKeyboard.Delete }, { text: DescriptionKeyboard.Back }],
        ],
        one_time_keyboard: true,
        // remove_keyboard: true
      },
    },
  );
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
      await updateSuggestion({ id: draftSuggestion.id, caption: "" });
      await ctx.reply("Описание удалено");
      await ctx.scene.enter(SceneAlias.Suggestion);
      return;
    }

    if (text === DescriptionKeyboard.Back) {
      await ctx.scene.enter(SceneAlias.Suggestion);
      return;
    }

    await updateSuggestion({ id: draftSuggestion.id, caption: text });
    await ctx.reply(
      "Описание успешно сохранено.\nЕсли хотите его изменить, просто отправьте сообщение ещё раз\nНажмите 'Назад', чтобы вернуться",
    );
  } catch (error) {
    errorHandler(ctx, error);
  }
});

export default descriptionSuggestionScene;

import { Markup } from "telegraf";
import { RefuseKeyboard } from ".";
import { ERRORS } from "../../const";
import { makeMessageToTg, makePostToTg } from "../../services/api/tg/tgApi";
import { getSuggestionsByStatus, updateSuggestion } from "../../services/suggestion";
import { Suggestion } from "../../types/suggestion";
import { getMessageWithSafeLength } from "../../utils/message";

export const getRefuseMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Вернуть в предложку", RefuseKeyboard.ReturnSuggestion)],
    [
      Markup.button.callback(
        "Использовать дефолтную фразу",
        RefuseKeyboard.UseDefaultPhrase,
      ),
    ],
    [Markup.button.callback("Назад", RefuseKeyboard.Back)],
  ]);
};

export const getNextRefusedSuggestionKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("▶️", RefuseKeyboard.GetNextSuggestion)],
    [Markup.button.callback("Назад", RefuseKeyboard.Back)],
  ]);
};

export const getConfirmSuggestionKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅", RefuseKeyboard.Confirm)],
    [Markup.button.callback("🔴", RefuseKeyboard.Cancel)],
  ]);
};

export const getPreparedForRefuseSuggestion = async () => {
  const preparedForRefuseSuggestions = await getSuggestionsByStatus(
    "preparedForRefuse",
  );
  if (!preparedForRefuseSuggestions[0]) throw Error(ERRORS.ADMIN_EMPTY_SUGGESTION);
  return preparedForRefuseSuggestions[0];
};

export const refuseSuggestion = async (suggestion: Suggestion, cause: string) => {
  const chatId = String(suggestion.userId);
  await makeMessageToTg({ chatId: chatId, text: "Ваш пост:" });
  await makePostToTg({
    post: {
      photos: suggestion.fileIds,
      text: getMessageWithSafeLength(suggestion.caption),
    },
    chatId,
  });
  await makeMessageToTg({ chatId: chatId, text: `Отклонён по причине:\n${cause}` });
  await makeMessageToTg({
    chatId: chatId,
    text: `Можете модифицировать вашу предложку и отправить её на повторное рассмотрение`,
  });

  updateSuggestion({ id: suggestion.id, status: "draft" });
};

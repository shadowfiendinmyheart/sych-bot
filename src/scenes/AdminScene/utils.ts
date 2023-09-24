import { Markup } from "telegraf";
import { MenuKeyboardAction, SuggestionKeyboardAction } from ".";

export const getAdminKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Предложка", MenuKeyboardAction.Suggestion)],
    [Markup.button.callback("Назад", MenuKeyboardAction.Back)],
  ]);
};

export const getSuggestionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("👍", SuggestionKeyboardAction.Approve),
      Markup.button.callback("👎", SuggestionKeyboardAction.Refuse),
    ],
  ]);
};

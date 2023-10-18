import { Markup } from "telegraf";
import { MenuKeyboardAction, SuggestionKeyboardAction } from ".";

export const getAdminKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Получить предложку", MenuKeyboardAction.GetSuggestion)],
    [Markup.button.callback("Назад", MenuKeyboardAction.Back)],
  ]);
};

export const getResolveSuggestionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("👍", SuggestionKeyboardAction.Approve),
      Markup.button.callback("👎", SuggestionKeyboardAction.Refuse),
    ],
  ]);
};

export const getNextSuggestionKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅", MenuKeyboardAction.GetSuggestion)],
    [Markup.button.callback("В главное меню", MenuKeyboardAction.Back)],
  ]);
};

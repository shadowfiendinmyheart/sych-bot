import { Markup } from "telegraf";
import { MenuKeyboardAction, SuggestionKeyboardAction } from ".";

export const getAdminKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "Смотреть предложку",
        MenuKeyboardAction.GetSuggestions,
      ),
    ],
    [
      Markup.button.callback(
        "Смотреть отказы предложки",
        MenuKeyboardAction.GetPreparedForRefuseSuggestions,
      ),
    ],
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
    [Markup.button.callback("▶️", MenuKeyboardAction.GetSuggestions)],
    [Markup.button.callback("В главное меню", MenuKeyboardAction.Back)],
  ]);
};

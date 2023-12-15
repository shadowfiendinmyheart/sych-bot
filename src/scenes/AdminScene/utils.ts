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
    [
      Markup.button.callback(
        "Смотреть статистику за последние 30 дней",
        MenuKeyboardAction.GetLast30DaysStats,
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
    [
      Markup.button.callback(
        "Показать админ-меню",
        MenuKeyboardAction.ShowAdminMenu,
      ),
    ],
    [Markup.button.callback("В главное меню", MenuKeyboardAction.Back)],
  ]);
};

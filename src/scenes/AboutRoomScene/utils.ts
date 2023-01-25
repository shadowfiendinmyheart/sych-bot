import { Markup } from "telegraf";
import { KeyboardAction } from ".";

export const getRoomKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Назад", KeyboardAction.Back)],
    [Markup.button.callback("Отредактировать", KeyboardAction.Back)],
    [Markup.button.callback("Удалить", KeyboardAction.Back)],
  ]);

import { Markup } from 'telegraf';
import { KeyboardAction } from '.';

export const getMenuKeyboard = (isAdmin: boolean) => {
  const buttons = [
    [Markup.button.callback('Предложка', KeyboardAction.Suggestion)],
    [Markup.button.callback('Сычевальня TOP', KeyboardAction.Suggestion)],
  ];
  if (isAdmin) {
    buttons.push([
      Markup.button.callback('Админка', KeyboardAction.Admin),
      Markup.button.callback('Репостер', KeyboardAction.Reposter),
    ]);
  }
  return Markup.inlineKeyboard(buttons);
};

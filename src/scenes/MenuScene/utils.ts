import { Markup } from 'telegraf';

import { KeyboardAction } from './types';

export const menuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Предложка', KeyboardAction.Suggestion)],
  [Markup.button.callback('Сычевальня TOP', KeyboardAction.Suggestion)],
]);

import { Markup } from 'telegraf';

import { KeyboardAction } from './types';

export const authKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Назад', KeyboardAction.Back)],
]);

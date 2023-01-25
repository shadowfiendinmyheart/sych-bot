import { Scenes } from 'telegraf';

import { getMenuKeyboard } from './utils';

import { SceneAlias } from '../../types/scenes';
import { checkIsAdmin } from '../../utils/user';

export enum KeyboardAction {
  Suggestion = 'Suggestion',
  Leaderboard = 'Leaderboard',
  Admin = 'AdminAction',
  Reposter = 'Reposer',
}

const menuScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Menu);

menuScene.enter(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Выберите нужный пункт меню', getMenuKeyboard(false));
    return;
  }

  const isAdmin = checkIsAdmin(userId);
  await ctx.reply('Выберите нужный пункт меню', getMenuKeyboard(isAdmin));
});

menuScene.action(KeyboardAction.Suggestion, async (ctx) => {
  const userId = ctx.from?.id;

  await ctx.scene.enter(SceneAlias.SendRoom);

  await ctx.reply(
    'Выберите нужный пункт меню',
    getMenuKeyboard(Boolean(userId))
  );
});

menuScene.action(KeyboardAction.Leaderboard, async (ctx) => {
  // enter to leaderboard scene
});

menuScene.action(KeyboardAction.Admin, async (ctx) => {
  // enter to admin scene
});

// enter to reposter scene
menuScene.action(KeyboardAction.Reposter, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Reposter);
});

export default menuScene;

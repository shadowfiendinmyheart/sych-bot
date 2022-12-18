import { Scenes } from 'telegraf';

import { menuKeyboard } from './utils';

import { SceneAlias } from '../../types/scenes';
import { KeyboardAction } from './types';

const menuScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Menu);

menuScene.enter(async(ctx) => {
  await ctx.reply('Выберите нужный пункт меню', menuKeyboard);
});

menuScene.action(KeyboardAction.Suggestion, async (ctx) => {
  const isSuggestionExist = false;
  if (isSuggestionExist) {
    await ctx.scene.enter(SceneAlias.AboutRoom);

    await ctx.reply('Выберите нужный пункт меню', menuKeyboard);
    return;
  }

  await ctx.scene.enter(SceneAlias.SendRoom);

  await ctx.reply('Выберите нужный пункт меню', menuKeyboard);
});

export default menuScene;

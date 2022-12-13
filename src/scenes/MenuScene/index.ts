import { Scenes } from 'telegraf';

import { authKeyboard } from './utils';

import { SceneAlias } from '../../types/scenes';
import { KeyboardAction } from './types';

const menuScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Menu);

menuScene.enter((ctx) => {
  ctx.reply('Выберите нужный пункт меню', authKeyboard);
});

menuScene.action(KeyboardAction.SendRoom, async (ctx) => {
  ctx.scene.enter(SceneAlias.SendRoom);
});

export default menuScene;

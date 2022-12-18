import { Scenes } from 'telegraf';

import { aboutRoomKeyboard } from './utils';

import { SceneAlias } from '../../types/scenes';
import { KeyboardAction } from './types';

const aboutRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.AboutRoom
);

aboutRoomScene.enter((ctx) => {
  // show suggestion
  ctx.reply('Ваша предложка...', aboutRoomKeyboard);
});

aboutRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

export default aboutRoomScene;

import { Scenes } from 'telegraf';

import { authKeyboard } from './utils';

import { SceneAlias } from '../../types/scenes';
import { KeyboardAction } from './types';

const sendRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.Menu
);

sendRoomScene.enter((ctx) => {
  ctx.reply(
    'Отправьте сообщение с фотографиями вашей сычевальни, по желанию можете добавить к вашей записи текст :)',
    authKeyboard
  );
});

sendRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

export default sendRoomScene;

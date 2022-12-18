import { Scenes } from 'telegraf';
import axios from 'axios';

import {
  savePostInFolder,
  saveSuggestionInfo,
  sendRoomKeyboard,
} from './utils';
import * as fs from 'fs';

import { SceneAlias } from '../../types/scenes';
import { KeyboardAction } from './types';
import { suggestionFolderPath } from '../../const';

const sendRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.SendRoom
);

sendRoomScene.enter((ctx) => {
  ctx.reply(
    'Отправьте сообщение с фотографиями вашей сычевальни, по желанию можете добавить к вашей записи текст :)',
    sendRoomKeyboard
  );
});

sendRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

sendRoomScene.on('photo', async (ctx) => {
  const photos = ctx.message.photo;
  const heading = ctx.message.caption;
  const userId = String(ctx.update.message.from.id);
  const username =
    ctx.update.message.from.username ||
    ctx.update.message.from.first_name + ctx.update.message.from.last_name;

  console.log('photos', photos[2]);

  const fileId = photos[2].file_id;

  const userDirectory = `${suggestionFolderPath}/${userId}`;

  if (fs.existsSync(userDirectory)) {
    await ctx.reply('Извини, ты уже отправлял предложку...');
    await ctx.scene.enter(SceneAlias.Menu);
    return;
  }

  fs.mkdirSync(userDirectory);

  const { href } = await ctx.telegram.getFileLink(fileId);

  try {
    await savePostInFolder(href, userDirectory, fileId);
    await saveSuggestionInfo({
      fileNames: [fileId],
      status: 'active',
      title: heading || '',
      user_id: userId,
      username: username,
    });
    await ctx.reply(
      'Предложка успешно отправлена\nВы можете отредактировать её, по желанию'
    );
    await ctx.scene.enter(SceneAlias.Menu);
  } catch (error) {
    await ctx.reply('Произошла ошибка на сервере... Попробуйте позже');
    console.log('save suggestion error', error);
    await ctx.scene.enter(SceneAlias.Menu);
  }
});

export default sendRoomScene;

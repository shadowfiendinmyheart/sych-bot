import { Context, Markup } from 'telegraf';
import axios from 'axios';
import { KeyboardAction } from '.';

export const getReposterKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Включить репостер', KeyboardAction.On)],
    [Markup.button.callback('Выключить репостер', KeyboardAction.Off)],
    [Markup.button.callback('Назад', KeyboardAction.Back)],
  ]);
};

/*
 *   VK Api logic
 */

const checkPeriod = 1800;

const checkIsPosted = (postTimestamp: number) => {
  const now = Date.now();
  return now - postTimestamp < checkPeriod;
};

export const getVkLastPost = async () => {
  // TODO: вынести запрос к вк в отдельную функцию
  const vkResponse = await axios({
    url: `https://api.vk.com/method/wall.get?v=5.131&owner_id=${process.env.VK_GROUP_ID}&access_token=${process.env.VK_API_TOKEN}&count=2`,
  });
  const lastPost = vkResponse.data.response.items[1];
  console.log(lastPost);
};

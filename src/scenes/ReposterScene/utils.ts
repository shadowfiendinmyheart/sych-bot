import { Markup } from "telegraf";
import { KeyboardAction } from ".";
import { checkIsPosted, checkIsValid, getVkLastPost } from "./vkApi";
import { makePostToTg } from "./tgApi";

export const getReposterKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Включить репостер", KeyboardAction.On)],
    [Markup.button.callback("Выключить репостер", KeyboardAction.Off)],
    [Markup.button.callback("Назад", KeyboardAction.Back)],
    [Markup.button.callback("Тест", KeyboardAction.Test)],
  ]);
};

export const checkPeriod = 1800000;

export const makeRepost = async () => {
  const vkPost = await getVkLastPost();
  const isPosted = checkIsPosted(Number(vkPost.date));
  const isValidToPost = checkIsValid(vkPost);

  if (!isValidToPost) {
    console.log(`Post ${vkPost.id} is not valid`);
    return;
  }

  if (isPosted) {
    console.log(
      Date.now(),
      `\nid: ${vkPost.id}\ntime: ${
        Number(vkPost.date) * 1000
      }\n already posted\n`
    );
    return;
  }

  const photosUrl = vkPost.attachments.reduce((prev, attachment) => {
    if (attachment.type !== "photo") return prev;
    let maxHeight = 0;
    let maxHeightIndex = 0;
    attachment.photo.sizes.forEach((size, index) => {
      if (size.height > maxHeight) {
        maxHeight = size.height;
        maxHeightIndex = index;
      }
    });
    const url = attachment.photo.sizes[maxHeightIndex].url;
    return [...prev, url];
  }, [] as string[]);

  const tgResponse = await makePostToTg({
    text: vkPost.text,
    photos: photosUrl,
  });
  if (!tgResponse) return;
  if (!tgResponse.data.ok) {
    console.log("Error post to tg:", tgResponse.data);
  }
};

import { Markup } from "telegraf";
import axios from "axios";
import { KeyboardAction } from ".";

export const getReposterKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Включить репостер", KeyboardAction.On)],
    [Markup.button.callback("Выключить репостер", KeyboardAction.Off)],
    [Markup.button.callback("Назад", KeyboardAction.Back)],
    [Markup.button.callback("Тест", KeyboardAction.Test)],
  ]);
};

/*
 *   VK Api logic
 */

export const checkPeriod = 1800000;

export const checkIsPosted = (postTimestamp: number) => {
  const now = Date.now();
  return now - postTimestamp * 1000 > checkPeriod;
};

interface VkPost {
  id: number;
  date: number;
  text: string;
  attachments: VkAttachment[];
}

interface VkAttachment {
  type: "photo" | "link";
  photo: VkPhoto;
}

interface VkPhoto {
  date: number;
  id: number;
  owner_id: number;
  sizes: Array<{
    type: "s" | "m" | "x" | "y" | "w" | "o" | "p" | "q" | "r";
    height: number;
    width: number;
    url: string;
  }>;
}

export const getVkLastPost = async (): Promise<VkPost> => {
  // TODO: вынести запрос к вк в отдельную функцию
  const vkResponse = await axios({
    url: `https://api.vk.com/method/wall.get?v=5.131&owner_id=${process.env.VK_GROUP_ID}&access_token=${process.env.VK_API_TOKEN}&count=2`,
  });
  const lastPost = vkResponse.data.response.items[1];
  return lastPost;
};

/*
 *   TG Api logic
 */

interface TgPost {
  text?: string;
  photos: string[];
}

export const makePostToTg = async (post: TgPost) => {
  if (post.photos?.length === 0) return;
  const photos = post.photos.map((photo, index) => {
    let media = {
      type: "photo",
      media: photo,
    };
    return index ? media : { caption: post.text, ...media };
  });
  const tgResponse = await axios.post(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMediaGroup`,
    {
      chat_id: process.env.TG_GROUP_ID,
      caption: post.text || "",
      media: photos,
    }
  );
  return tgResponse;
};

export const makeRepost = async () => {
  const vkPost = await getVkLastPost();
  const isPosted = checkIsPosted(Number(vkPost.date));

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
    })
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

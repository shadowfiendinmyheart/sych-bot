import axios from "axios";
import { checkPeriod } from "./utils";

interface VkPost {
  id: number;
  date: number;
  text: string;
  marked_as_ads: 0 | 1;
  post_type: "post" | "repost";
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

export const checkIsPosted = (postTimestamp: number) => {
  const now = Date.now();
  return now - postTimestamp * 1000 > checkPeriod;
};

export const checkIsValid = (post: VkPost) => {
  if (post.marked_as_ads || post.post_type !== "post") return false;
  return true;
};

export const getVkLastPost = async (): Promise<VkPost> => {
  // TODO: вынести запрос к вк в отдельную функцию
  const vkResponse = await axios({
    url: `https://api.vk.com/method/wall.get?v=5.131&owner_id=${process.env.VK_GROUP_ID}&access_token=${process.env.VK_API_TOKEN}&count=2`,
  });
  const lastPost = vkResponse.data.response.items[1];
  return lastPost;
};

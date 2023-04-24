import axios from "axios";
import config from "../../config";
import { CHECK_PERIOD } from "./utils";

export interface VkPost {
  id: number;
  date: number;
  text: string;
  marked_as_ads: 0 | 1;
  post_type: "post" | "repost";
  views: {
    count: number;
  };
  likes: {
    count: number;
  };
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

export const vkRequest = async (method: string, params?: object) => {
  try {
    const vkResponse = await axios.get(`https://api.vk.com/method/${method}`, {
      params: {
        v: "5.131",
        access_token: config.VK_API_TOKEN,
        ...params,
      },
    });
    if (vkResponse.statusText !== "OK") {
      console.log("vkResponse is not ok", vkResponse.data.response);
      return;
    }
    return vkResponse.data.response;
  } catch (e: any) {
    console.log("vk request error:", e);
  }
};

export const checkIsPosted = (postTimestamp: number) => {
  const now = Date.now();
  return now - postTimestamp * 1000 > CHECK_PERIOD;
};

export const checkIsValid = (post: VkPost) => {
  if (post.marked_as_ads || post.post_type !== "post") return false;
  return true;
};

export const getVkLastPost = async (): Promise<VkPost> => {
  const vkResponse = await vkRequest("wall.get", {
    count: 2,
    owner_id: config.VK_GROUP_ID,
  });
  const lastPost = vkResponse.items[0];
  return lastPost;
};

export const getVkPostById = async (postId: number): Promise<VkPost> => {
  const vkResponse = await vkRequest("wall.getById", {
    posts: `${config.VK_GROUP_ID}_${postId}`,
  });
  const post: VkPost = vkResponse[0];
  return post;
};

export const getVkPosts = async (offset: number): Promise<Array<VkPost>> => {
  const vkResponse = await vkRequest("wall.get", {
    count: 100,
    offset: offset,
    owner_id: config.VK_GROUP_ID,
  });
  const posts = vkResponse.items;
  return posts;
};

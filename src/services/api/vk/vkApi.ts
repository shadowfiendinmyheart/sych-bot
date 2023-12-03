import axios from "axios";
import config from "../../../config";
import { CHECK_PERIOD } from "../../../scenes/ReposterScene/utils";
import {
  ErrorResponse,
  GetByIdResponse,
  GetWallResponse,
  VkPost,
} from "./interfaces";

export const vkRequest = async <Response>(
  method: string,
  params?: object,
): Promise<Response | ErrorResponse | undefined> => {
  try {
    const vkResponse = await axios.get(`https://api.vk.com/method/${method}`, {
      params: {
        v: "5.131",
        access_token: config.VK_API_TOKEN,
        ...params,
      },
    });

    if (vkResponse.statusText !== "OK") {
      throw Error(`vkResponse is not ok ${vkResponse.data.response}`);
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
  return post.marked_as_ads === 0 && !post.copyright && post.post_type === "post";
};

export const getVkLastPost = async (): Promise<VkPost | undefined> => {
  const response = await vkRequest<GetWallResponse>("wall.get", {
    count: 2,
    owner_id: config.VK_GROUP_ID,
  });
  if (!response) return;
  if ("error" in response) throw Error(JSON.stringify(response));
  const lastPost = response.items[1];
  return lastPost;
};

export const getVkPostById = async (postId: number): Promise<VkPost | undefined> => {
  const response = await vkRequest<GetByIdResponse>("wall.getById", {
    posts: `${config.VK_GROUP_ID}_${postId}`,
  });
  if (!response) return;
  if ("error" in response) throw Error(JSON.stringify(response));
  const post: VkPost = response[0];
  return post;
};

export const getVkPostCount = async () => {
  const response = await vkRequest<GetWallResponse>("wall.get", {
    owner_id: config.VK_GROUP_ID,
  });
  if (!response) return;
  if ("error" in response) throw Error(JSON.stringify(response));
  return response.count;
};

const MAX_POST_COUNT = 100; // ограничение vk api
export const getVkPosts = async (
  offset?: number,
  count: number = MAX_POST_COUNT,
): Promise<Array<VkPost> | undefined> => {
  try {
    if (count > MAX_POST_COUNT)
      throw Error("the number of records cannot be more than one hundred");
    const response = await vkRequest<GetWallResponse>("wall.get", {
      count: count,
      offset: offset,
      owner_id: config.VK_GROUP_ID,
    });
    if (!response) return;
    if ("error" in response) throw Error(JSON.stringify(response));
    const posts = response.items;
    return posts;
  } catch (error) {
    console.log("getVkPosts error:", error);
  }
};

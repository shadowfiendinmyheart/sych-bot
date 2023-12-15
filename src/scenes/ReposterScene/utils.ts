import * as fs from "fs";
import { Markup } from "telegraf";
import { KeyboardAction } from ".";
import {
  checkIsPosted,
  checkIsValid,
  getVkLastPost,
  getVkPosts,
} from "../../services/api/vk/vkApi";
import { makePostToTg } from "../../services/api/tg/tgApi";
import {
  ENCODING_FORMAT,
  ERRORS,
  POSTS_FILE_NAME,
  POSTS_PATH,
  SORTED_POSTS_FILE_NAME,
} from "../../const";
import awaiter from "../../utils/awaiter";
import config from "../../config";
import { editMessageCaption, getMessageWithSourceLink } from "../../utils/message";
import { VkPost } from "../../services/api/vk/interfaces";

interface PostData {
  id: number;
  view: number;
  likes: number;
}

export const getReposterKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Включить репостер", KeyboardAction.On)],
    [Markup.button.callback("Выключить репостер", KeyboardAction.Off)],
    [Markup.button.callback("Назад", KeyboardAction.Back)],
    [Markup.button.callback("Обновить посты", KeyboardAction.UpdatePosts)],
    [Markup.button.callback("Запостить!", KeyboardAction.MakePost)],
  ]);
};

export const CHECK_PERIOD = 1_800_000; // 30 minutes

export const makeRepost = async () => {
  try {
    const vkPost = await getVkLastPost();
    if (!vkPost) throw Error(ERRORS.GET_VK_POST);

    const isPosted = checkIsPosted(Number(vkPost.date));
    if (isPosted) {
      console.log(
        Date.now(),
        `\n---reposter---\nvk post id: ${vkPost.id}\ntime: ${
          Number(vkPost.date) * 1000
        }\nalready posted\n`,
      );
      return;
    }

    const isValidToPost = checkIsValid(vkPost);
    if (!isValidToPost) {
      console.log(`Post ${vkPost.id} is not valid`);
      return;
    }

    const photosUrl = getPhotosFromVkPost(vkPost);
    if (photosUrl.length === 0) {
      console.log(`Post: ${vkPost.id} hasn't photos`);
      return;
    }

    const messageWithSourceLink = getMessageWithSourceLink(
      `#fromVk \n\n${vkPost.text}`,
      `${config.VK_POST_LINK}${vkPost.id}`,
    );
    const tgPostResponse = await makePostToTg({
      post: { text: messageWithSourceLink, photos: photosUrl },
    });
    await editMessageCaption(
      tgPostResponse.result[0].message_id,
      messageWithSourceLink,
    );
  } catch (error) {
    console.log("makeRepost error:", error);
  }
};

export const getPhotosFromVkPost = (vkPost: VkPost) => {
  return vkPost.attachments.reduce((prev, attachment) => {
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
};

const createFileIfNotExist = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }
};

export const updateFilePosts = async () => {
  if (!fs.existsSync(POSTS_PATH)) {
    fs.mkdirSync(POSTS_PATH);
  }
  const postsInfoFilePath = `${POSTS_PATH}/${POSTS_FILE_NAME}`;
  createFileIfNotExist(postsInfoFilePath);

  fs.writeFileSync(postsInfoFilePath, JSON.stringify({ posts: [] }));

  let offset = 1;
  let newPosts;
  do {
    newPosts = (await getVkPosts(offset)) || [];
    if (newPosts.length < 90) {
      // останавливаемся, если посты заканчиваются
      break;
    }

    const postsRaw = fs.readFileSync(postsInfoFilePath, ENCODING_FORMAT);
    const postsParsed = JSON.parse(postsRaw).posts;
    const prettyPosts = newPosts.map((post) => {
      return {
        id: post.id,
        view: post.views.count,
        likes: post.likes.count,
      };
    });

    const updatedPosts = {
      posts: [...postsParsed, ...prettyPosts],
    };

    fs.writeFileSync(postsInfoFilePath, JSON.stringify(updatedPosts));
    offset += 100;
    await awaiter(10000); // антиспам
    console.log("updating...\nprogress:", offset);
  } while (newPosts.length > 90);

  const posts = getFilePosts("default");
  const maxLikedSortedPosts = posts.sort((a, b) => b.likes - a.likes).slice(0, 300);
  const maxViewedSortedPosts = posts.sort((a, b) => b.view - a.view).slice(0, 300);
  const unionPosts = maxLikedSortedPosts
    .filter((maxLiked) =>
      maxViewedSortedPosts.find((maxViewed) => maxLiked.id === maxViewed.id),
    )
    .slice(0, 100)
    .reverse();

  const sortedPostsFilePath = `${POSTS_PATH}/${SORTED_POSTS_FILE_NAME}`;
  createFileIfNotExist(sortedPostsFilePath);
  fs.writeFileSync(sortedPostsFilePath, JSON.stringify({ posts: unionPosts }));
};

export const getFilePosts = (postsType: "sorted" | "default"): Array<PostData> => {
  const postsInfoFilePath = `${POSTS_PATH}/${
    postsType === "default" ? POSTS_FILE_NAME : SORTED_POSTS_FILE_NAME
  }`;

  const postsRaw = fs.readFileSync(postsInfoFilePath, ENCODING_FORMAT);
  const postsParsed = JSON.parse(postsRaw).posts;

  return postsParsed;
};

const postCounterFilePath = `${POSTS_PATH}/postCounter.txt`;
export const getPostCounter = () => {
  createFileIfNotExist(postCounterFilePath);
  const counter = fs.readFileSync(postCounterFilePath, ENCODING_FORMAT);
  return counter;
};

export const setPostCounter = (counter: number) => {
  try {
    createFileIfNotExist(postCounterFilePath);
    fs.writeFileSync(postCounterFilePath, String(counter), {
      encoding: ENCODING_FORMAT,
    });
    return true;
  } catch (error) {
    console.log("setPostCounter error:", error);
    return false;
  }
};

export const increasePostCounter = () => {
  createFileIfNotExist(postCounterFilePath);
  const counter = fs.readFileSync(postCounterFilePath, ENCODING_FORMAT);
  const updatedCounter = Number(counter) + 1;
  fs.writeFileSync(postCounterFilePath, String(updatedCounter), {
    encoding: ENCODING_FORMAT,
  });
  return updatedCounter;
};

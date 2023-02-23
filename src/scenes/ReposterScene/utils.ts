import * as fs from "fs";
import { Context, Markup } from "telegraf";
import { KeyboardAction } from ".";
import {
  checkIsPosted,
  checkIsValid,
  getVkLastPost,
  getVkPosts,
  VkPost,
} from "./vkApi";
import { makePostToTg } from "./tgApi";
import { ENCODING_FORMAT, postsInfoPath } from "../../const";
import awaiter from "../../utils/awaiter";

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

  const photosUrl = getPhotosFromVkPost(vkPost);

  const tgResponse = await makePostToTg({
    text: vkPost.text,
    photos: photosUrl,
  });
  if (!tgResponse) return;
  if (!tgResponse.data.ok) {
    console.log("Error post to tg:", tgResponse.data);
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
    fs.writeFile(filePath, "", (error) => {
      console.log("error:", error);
    });
  }
};

export const updatePostsData = async () => {
  if (!fs.existsSync(postsInfoPath)) {
    fs.mkdirSync(postsInfoPath);
  }
  const postsInfoFilePath = `${postsInfoPath}/posts.json`;
  createFileIfNotExist(postsInfoFilePath);

  fs.writeFileSync(postsInfoFilePath, JSON.stringify({ posts: [] }));

  let offset = 1;
  let newPosts;
  do {
    newPosts = await getVkPosts(offset);
    if (newPosts.length < 90) {
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
  } while (newPosts.length > 90);
};

export const getPostsData = (): Array<PostData> => {
  const postsInfoFilePath = `${postsInfoPath}/posts.json`;

  const postsRaw = fs.readFileSync(postsInfoFilePath, ENCODING_FORMAT);
  const postsParsed = JSON.parse(postsRaw).posts;

  return postsParsed;
};

const postCounterFilePath = `${postsInfoPath}/postCounter.txt`;

export const getPostCounter = () => {
  createFileIfNotExist(postCounterFilePath);
  const counter = fs.readFileSync(postCounterFilePath, ENCODING_FORMAT);
  return counter;
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

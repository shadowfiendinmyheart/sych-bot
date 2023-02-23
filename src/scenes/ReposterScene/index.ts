import { Scenes } from "telegraf";

import {
  checkPeriod,
  getPhotosFromVkPost,
  getPostCounter,
  getPostsData,
  getReposterKeyboard,
  increasePostCounter,
  makeRepost,
  updatePostsData,
} from "./utils";

import { SceneAlias } from "../../types/scenes";
import { getVkPostById } from "./vkApi";
import { makePostToTg } from "./tgApi";
import { MAX_TG_MESSAGE_LENGTH } from "../../const";
import { chatLogger } from "../../utils/message";

export enum KeyboardAction {
  On = "On",
  Off = "Off",
  Back = "Back",
  MakePost = "MakePost",
  UpdatePosts = "UpdatePosts",
}

let interval: NodeJS.Timer;

const reposterScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Reposter);

reposterScene.enter(async (ctx) => {
  await ctx.reply("Выберите нужный пункт меню", getReposterKeyboard());
});

reposterScene.action(KeyboardAction.On, async (ctx) => {
  if (interval) {
    console.log("interval already working...");
    ctx.reply("Репостер уже работает");
    return;
  }

  interval = setInterval(async () => {
    await makeRepost();
  }, checkPeriod);
  ctx.reply("Репостер включился!");
});

reposterScene.action(KeyboardAction.Off, async (ctx) => {
  console.log("off", interval);
  // TODO: check is interval empty
  if (!interval) {
    console.log("interval is empty...");
    return;
  }
  clearInterval(interval);
  ctx.reply("Репостер отключен...");
});

reposterScene.action(KeyboardAction.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Menu);
});

reposterScene.action(KeyboardAction.MakePost, async (ctx) => {
  try {
    const counter = Number(getPostCounter());
    const posts = getPostsData();

    if (counter === 100) {
      ctx.reply("100 запись!");
      return;
    }

    // числа взял с потолка, чтобы получалось ~100 записей в пересечении
    const maxLikedSortedPosts = posts
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 300);
    const maxViewedSortedPosts = posts.sort((a, b) => b.view - a.view).slice(0, 300);
    const unionPosts = maxLikedSortedPosts
      .filter((maxLiked) =>
        maxViewedSortedPosts.find((maxViewed) => maxLiked.id === maxViewed.id),
      )
      .slice(0, 100)
      .reverse();

    const curPost = await getVkPostById(unionPosts[counter].id);
    const postText =
      curPost.text.length > MAX_TG_MESSAGE_LENGTH
        ? curPost.text.slice(0, MAX_TG_MESSAGE_LENGTH) + "..."
        : curPost.text;
    const messageWithLink = `${postText}\n\n<a href="${process.env.VK_POST_LINK}${curPost.id}">Источник с комментариями</a>`;
    const photos = getPhotosFromVkPost(curPost);
    const tgPostResponse = await makePostToTg({
      text: postText,
      photos: photos,
    });
    await ctx.telegram.editMessageCaption(
      String(process.env.TG_GROUP_ID),
      tgPostResponse.result[0].message_id,
      undefined,
      messageWithLink,
      { parse_mode: "HTML" },
    );
    increasePostCounter();
    const updatedCounter = getPostCounter();
    await chatLogger(ctx, `Successul🍀\ncurrent post counter ${updatedCounter}`);
  } catch {
    await chatLogger(ctx, "error while sending post...");
  }
});

reposterScene.action(KeyboardAction.UpdatePosts, async (ctx) => {
  await updatePostsData();
  await chatLogger(ctx, "posts updated!");
});

export default reposterScene;

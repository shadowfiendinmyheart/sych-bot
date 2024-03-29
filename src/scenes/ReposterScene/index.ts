import { Scenes } from "telegraf";
import config from "../../config";

import {
  CHECK_PERIOD,
  getPhotosFromVkPost,
  getPostCounter,
  getFilePosts,
  getReposterKeyboard,
  increasePostCounter,
  makeRepost,
  updateFilePosts,
  setPostCounter,
} from "./utils";

import { SceneAlias } from "../../types/scenes";
import { getVkPostById } from "../../services/api/vk/vkApi";
import { makePostToTg } from "../../services/api/tg/tgApi";
import {
  chatLogger,
  editMessageCaption,
  getMessageWithSourceLink,
} from "../../utils/message";
import { errorHandlerWithLogger } from "../utils";
import { ERRORS } from "../../const";

export enum KeyboardAction {
  On = "On",
  Off = "Off",
  Back = "Back",
  MakePost = "MakePost",
  UpdatePosts = "UpdatePosts",
}

let interval: NodeJS.Timer | null;

const reposterScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Reposter);

reposterScene.enter(async (ctx) => {
  await ctx.reply("Выберите нужный пункт меню", getReposterKeyboard());
});

reposterScene.action(KeyboardAction.On, async (ctx) => {
  if (interval) {
    await ctx.reply("Репостер уже работает");
    return;
  }

  interval = setInterval(async () => {
    await makeRepost();
  }, CHECK_PERIOD);
  await ctx.reply("Репостер включился!");
});

reposterScene.action(KeyboardAction.Off, async (ctx) => {
  if (!interval) {
    await ctx.reply("Репостер уже отключен");
    return;
  }
  clearInterval(interval);
  interval = null;
  await ctx.reply("Репостер отключен...");
});

reposterScene.action(KeyboardAction.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Menu);
});

reposterScene.action(KeyboardAction.MakePost, async (ctx) => {
  try {
    const counter = Number(getPostCounter());
    if (counter === 100) {
      await ctx.reply("100 запись!");
      return;
    }

    const posts = getFilePosts("sorted");
    const curPost = await getVkPostById(posts[counter].id);
    if (!curPost) throw Error(ERRORS.GET_VK_POST);
    const messageWithSourceLink = getMessageWithSourceLink(
      curPost.text,
      `${config.VK_POST_LINK}${curPost.id}`,
    );
    const photos = getPhotosFromVkPost(curPost);
    const tgPostResponse = await makePostToTg({
      post: { text: messageWithSourceLink, photos: photos },
    });
    await editMessageCaption(
      tgPostResponse.result[0].message_id,
      messageWithSourceLink,
    );
    increasePostCounter();
    const updatedCounter = getPostCounter();
    await chatLogger(ctx, `Successul🍀\ncurrent post counter ${updatedCounter}`);
  } catch (error: any) {
    await errorHandlerWithLogger({ ctx, error, about: "reposter scene make post" });
  }
});

reposterScene.action(KeyboardAction.UpdatePosts, async (ctx) => {
  try {
    await chatLogger(ctx, "Start updating posts...");
    await updateFilePosts();
    setPostCounter(0);
    await chatLogger(ctx, "posts updated!");
  } catch (error) {
    await errorHandlerWithLogger({
      ctx,
      error,
      about: "reposter scene update posts",
    });
  }
});

export default reposterScene;

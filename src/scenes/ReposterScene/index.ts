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
import { getVkPostById } from "../../services/api/vkApi";
import { makePostToTg } from "../../services/api/tgApi";
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
  }, CHECK_PERIOD);
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
    if (counter === 100) {
      ctx.reply("100 запись!");
      return;
    }

    const posts = getFilePosts("sorted");
    const curPost = await getVkPostById(posts[counter].id);
    const postText =
      curPost.text.length > MAX_TG_MESSAGE_LENGTH
        ? curPost.text.slice(0, MAX_TG_MESSAGE_LENGTH) + "..."
        : curPost.text;
    const messageWithLink = `${postText}\n\n<a href="${config.VK_POST_LINK}${curPost.id}">Источник с комментариями</a>`;
    const photos = getPhotosFromVkPost(curPost);
    const tgPostResponse = await makePostToTg({
      post: { text: postText, photos: photos },
    });
    await ctx.telegram.editMessageCaption(
      String(config.TG_GROUP_ID),
      tgPostResponse.result[0].message_id,
      undefined,
      messageWithLink,
      { parse_mode: "HTML" },
    );
    increasePostCounter();
    const updatedCounter = getPostCounter();
    await chatLogger(ctx, `Successul🍀\ncurrent post counter ${updatedCounter}`);
  } catch (error: any) {
    await chatLogger(ctx, "error while sending post...", error);
  }
});

reposterScene.action(KeyboardAction.UpdatePosts, async (ctx) => {
  try {
    await chatLogger(ctx, "Start updating posts...");
    await updateFilePosts();
    setPostCounter(0);
    await chatLogger(ctx, "posts updated!");
  } catch (error) {
    console.log("fail on update posts\nerr:", error);
  }
});

export default reposterScene;

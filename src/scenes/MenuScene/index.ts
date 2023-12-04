import { Scenes } from "telegraf";
import config from "../../config";
import { ERRORS } from "../../const";
import { makePostToTg } from "../../services/api/tg/tgApi";
import { getVkPostCount, getVkPosts } from "../../services/api/vk/vkApi";

import { SceneAlias } from "../../types/scenes";
import { editMessageCaption, getMessageWithSourceLink } from "../../utils/message";
import { getPhotosFromVkPost } from "../ReposterScene/utils";
import { errorHandlerWithLogger } from "../utils";
import { getMenuKeyboard, helpHtmlMenuScene, isAllowToMakeRequest } from "./utils";

export enum KeyboardAction {
  Suggestion = "Suggestion",
  GetRandomVkPost = "GetRandomVkPost",
  Help = "Help",
  Leaderboard = "Leaderboard",
  Admin = "AdminAction",
  Reposter = "Reposer",
}

const menuScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Menu);

menuScene.enter(async (ctx) => {
  try {
    await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(ctx));
  } catch (error) {
    await errorHandlerWithLogger({ ctx, error, about: "menu scene enter" });
  }
});

menuScene.action(KeyboardAction.Suggestion, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Suggestion);
});

let vkPostCount: number;
menuScene.action(KeyboardAction.GetRandomVkPost, async (ctx) => {
  try {
    const chatId = String(ctx.chat?.id) || "0";
    const userId = ctx.from?.id || 0;

    if (!isAllowToMakeRequest(userId)) {
      await ctx.reply("Пожалуйста, подождите 1 минуту");
      return;
    }

    if (!vkPostCount) {
      const vkPostCountResponse = await getVkPostCount();
      if (!vkPostCountResponse) throw Error(ERRORS.GET_RANDOM_VK_POST);
      vkPostCount = vkPostCountResponse;
    }
    const randomNumber = Math.round(Math.random() * vkPostCount);
    const postResponse = await getVkPosts(randomNumber, 1);
    if (!postResponse) throw Error(ERRORS.GET_RANDOM_VK_POST);
    const post = postResponse[0];
    const messageWithSourceLink = getMessageWithSourceLink(
      post.text,
      `${config.VK_POST_LINK}${post.id}`,
    );
    const photos = getPhotosFromVkPost(post);
    const tgPostResponse = await makePostToTg({
      post: { text: messageWithSourceLink, photos: photos },
      chatId,
    });
    await editMessageCaption(
      tgPostResponse.result[0].message_id,
      messageWithSourceLink,
      chatId,
    );
  } catch (error) {
    errorHandlerWithLogger({ ctx, error, about: "get random vk post" });
  } finally {
    await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(ctx));
  }
});

menuScene.action(KeyboardAction.Help, async (ctx) => {
  await ctx.replyWithHTML(helpHtmlMenuScene);
  await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(ctx));
});

menuScene.action(KeyboardAction.Leaderboard, async (ctx) => {
  // enter to leaderboard scene
});

// enter to admin scene
menuScene.action(KeyboardAction.Admin, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Admin);
});

// enter to reposter scene
menuScene.action(KeyboardAction.Reposter, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Reposter);
});

export default menuScene;

import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { makeMessageToTg, makePostToTg } from "../../services/api/tgApi";
import { getSuggestionList } from "../../services/suggestion";
import { getAdminKeyboard, getSuggestionKeyboard } from "./utils";

export enum MenuKeyboardAction {
  Suggestion = "Suggestion",
  Back = "Back",
}

export enum SuggestionKeyboardAction {
  Approve = "Approve",
  Refuse = "Refuse",
}

const adminScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Admin);

adminScene.enter(async (ctx) => {
  await ctx.reply("admin menu 😎🤙🏻", getAdminKeyboard());
});

adminScene.action(MenuKeyboardAction.Suggestion, async (ctx) => {
  const chatId = ctx.chat?.id || 0;
  const suggestions = await getSuggestionList();
  const newSuggestions = Object.values(suggestions).filter(
    (suggestion) => suggestion.status === "new",
  );
  // TODO: generators???
  for (const suggestion of newSuggestions) {
    await makePostToTg(
      { photos: suggestion.fileIds, text: suggestion.caption },
      String(chatId),
    );
    await makeMessageToTg({
      chatId,
      text: "Норм? <code>copy me!</code>",
      replyMarkup: getSuggestionKeyboard(),
    });
  }
});

adminScene.action(MenuKeyboardAction.Back, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Menu);
});

export default adminScene;

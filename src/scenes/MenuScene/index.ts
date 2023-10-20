import { Scenes } from "telegraf";

import { getMenuKeyboard } from "./utils";

import { SceneAlias } from "../../types/scenes";
import { checkIsAdmin } from "../../utils/user";

export enum KeyboardAction {
  Suggestion = "Suggestion",
  Leaderboard = "Leaderboard",
  Admin = "AdminAction",
  Reposter = "Reposer",
}

const menuScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Menu);

menuScene.enter(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(false));
    return;
  }

  const isAdmin = checkIsAdmin(userId);
  await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(isAdmin));
});

menuScene.action(KeyboardAction.Suggestion, async (ctx) => {
  await ctx.scene.enter(SceneAlias.Suggestion);
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

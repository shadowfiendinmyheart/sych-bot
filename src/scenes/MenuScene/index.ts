import { Scenes } from "telegraf";

import { SceneAlias } from "../../types/scenes";
import { checkIsAdmin } from "../../utils/user";
import { errorHandlerWithLogger } from "../utils";
import { getMenuKeyboard } from "./utils";

export enum KeyboardAction {
  Suggestion = "Suggestion",
  Leaderboard = "Leaderboard",
  Admin = "AdminAction",
  Reposter = "Reposer",
}

const menuScene = new Scenes.BaseScene<Scenes.SceneContext>(SceneAlias.Menu);

menuScene.enter(async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) {
      await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(false));
      return;
    }

    const isAdmin = checkIsAdmin(userId);
    await ctx.reply("Выберите нужный пункт меню", getMenuKeyboard(isAdmin));
  } catch (error) {
    await errorHandlerWithLogger({ ctx, error, about: "menu scene enter" });
  }
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

import { Scenes } from "telegraf";

import { checkPeriod, getReposterKeyboard, makeRepost } from "./utils";

import { SceneAlias } from "../../types/scenes";

export enum KeyboardAction {
  On = "On",
  Off = "Off",
  Back = "Back",
  Test = "Test",
}

let interval: NodeJS.Timer;

const reposterScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.Reposter
);

reposterScene.enter(async (ctx) => {
  const userId = ctx.from?.id;
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

reposterScene.action(KeyboardAction.Test, async (ctx) => {
  await makeRepost();
});

export default reposterScene;

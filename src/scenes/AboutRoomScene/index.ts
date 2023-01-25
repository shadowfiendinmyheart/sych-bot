import { Scenes } from "telegraf";

import { getRoomKeyboard } from "./utils";

import { SceneAlias } from "../../types/scenes";

export enum KeyboardAction {
  Back = "Back",
}

const aboutRoomScene = new Scenes.BaseScene<Scenes.SceneContext>(
  SceneAlias.AboutRoom
);

aboutRoomScene.enter((ctx) => {
  // show suggestion
  ctx.reply("Ваша предложка...", getRoomKeyboard());
});

aboutRoomScene.action(KeyboardAction.Back, async (ctx) => {
  ctx.scene.enter(SceneAlias.Menu);
});

export default aboutRoomScene;

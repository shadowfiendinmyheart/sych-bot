import {
  BaseScene,
  SceneContext,
  SceneSessionData,
} from "telegraf/typings/scenes";

export const unexceptedUserInputHandler = (
  scene: BaseScene<SceneContext<SceneSessionData>>
) => {
  // TODO: рандомные ответы
  scene.on("audio", async (ctx) => {
    await ctx.replyWithHTML(
      "Ого, какая крутая песня!\n🎵Я оценил твой музыкальный вкус🎵"
    );
  });

  scene.on("sticker", async (ctx) => {
    await ctx.replyWithHTML("Интересный стикер. . .");
  });
};

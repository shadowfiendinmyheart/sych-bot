import { BaseScene, SceneContext, SceneSessionData } from "telegraf/typings/scenes";
import { errorHandlerWithLogger } from "../scenes/utils";

export const unexceptedUserInputHandler = (
  scenes: BaseScene<SceneContext<SceneSessionData>>[],
) => {
  scenes.forEach((scene) => {
    scene.on("audio", async (ctx) => {
      try {
        await ctx.replyWithHTML(
          "Ого, какая крутая песня!\n🎵Я оценил твой музыкальный вкус🎵",
        );
      } catch (error) {
        await errorHandlerWithLogger({ ctx, error, about: "on audio" });
      }
    });

    scene.on("sticker", async (ctx) => {
      try {
        await ctx.replyWithHTML("Интересный стикер...");
      } catch (error) {
        await errorHandlerWithLogger({ ctx, error, about: "on sticker" });
      }
    });
  });
};

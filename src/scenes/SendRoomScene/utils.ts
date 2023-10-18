import * as fs from "fs";
import axios from "axios";
import { Markup } from "telegraf";

export enum KeyboardAction {
  Back = "Back",
  Photo = "Photo",
  Description = "Description",
  Show = "Show",
  Send = "Send",
  Delete = "Delete",
}

// TODO make keyboard for empty suggestion
export const getSendRoomKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Добавить фотографии", KeyboardAction.Photo)],
    [Markup.button.callback("Добавить описание", KeyboardAction.Description)],
    [Markup.button.callback("Посмотреть предложку", KeyboardAction.Show)],
    [Markup.button.callback("Отправить предложку", KeyboardAction.Send)],
    [Markup.button.callback("Удалить предложку", KeyboardAction.Delete)],
    [Markup.button.callback("Назад", KeyboardAction.Back)],
  ]);

export const savePhotoInFolder = async (
  href: string,
  folderPath: string,
  fileName: string,
) => {
  const response = await axios({ url: href, responseType: "stream" });
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(`${folderPath}/${fileName}.jpg`))
      .on("finish", () => {
        console.log("file saved!");
        resolve(true);
      })
      .on("error", (e: Error) => {
        console.log(e);
        fs.rmSync(folderPath, { recursive: true, force: true });
        reject(e);
      });
  });
};

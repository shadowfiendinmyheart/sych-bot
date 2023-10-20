import * as fs from "fs";
import axios from "axios";
import { Markup } from "telegraf";
import { Suggestion } from "../../types/suggestion";

export enum KeyboardAction {
  Back = "Back",
  Photo = "Photo",
  Description = "Description",
  Show = "Show",
  Send = "Send",
  ToDraft = "ToDraft",
  Delete = "Delete",
}

export const getSuggestionKeyboard = (suggestion: Suggestion) => {
  const buttons = [
    [Markup.button.callback("Добавить/удалить фотографии", KeyboardAction.Photo)],
    [
      Markup.button.callback(
        "Добавить/удалить описание",
        KeyboardAction.Description,
      ),
    ],
  ];

  if (suggestion.fileIds.length > 0)
    buttons.push([
      Markup.button.callback("Посмотреть предложку", KeyboardAction.Show),
    ]);
  if (suggestion.status === "draft" && suggestion.fileIds.length > 0)
    buttons.push([
      Markup.button.callback("Отправить предложку", KeyboardAction.Send),
    ]);
  if (suggestion.status === "new")
    buttons.push([
      Markup.button.callback("Возвартить предложку", KeyboardAction.ToDraft),
    ]);
  if (suggestion.fileIds.length > 0 || suggestion.caption)
    buttons.push([
      Markup.button.callback("Удалить предложку", KeyboardAction.Delete),
    ]);

  buttons.push([Markup.button.callback("Назад", KeyboardAction.Back)]);

  return Markup.inlineKeyboard(buttons);
};

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

import * as fs from "fs";
import axios from "axios";
import { Markup } from "telegraf";
import { Suggestion } from "../../types/suggestion";
import { adminIds } from "../../utils/user";
import { makeMessageToTg } from "../../services/api/tg/tgApi";

export enum KeyboardAction {
  Back = "Back",
  Photo = "Photo",
  Description = "Description",
  Show = "Show",
  Send = "Send",
  ToDraft = "ToDraft",
  Delete = "Delete",
  Help = "Help",
}

export const getSuggestionKeyboard = (suggestion: Suggestion) => {
  const buttons = [];
  const isSuggestionHasPhotos = suggestion.fileIds.length > 0;

  if (suggestion.status === "draft") {
    buttons.push([
      Markup.button.callback("Добавить/удалить фотографии", KeyboardAction.Photo),
    ]);
    buttons.push([
      Markup.button.callback(
        "Добавить/удалить описание",
        KeyboardAction.Description,
      ),
    ]);
    if (isSuggestionHasPhotos) {
      buttons.push([
        Markup.button.callback("Отправить предложку", KeyboardAction.Send),
      ]);
    }
    if (isSuggestionHasPhotos || suggestion.caption) {
      buttons.push([
        Markup.button.callback("Удалить предложку", KeyboardAction.Delete),
      ]);
    }
  }

  if (isSuggestionHasPhotos || suggestion.caption) {
    buttons.push([
      Markup.button.callback("Посмотреть предложку", KeyboardAction.Show),
    ]);
  }
  if (suggestion.status === "sent") {
    buttons.push([
      Markup.button.callback("Возвартить предложку", KeyboardAction.ToDraft),
    ]);
  }

  buttons.push([Markup.button.callback("Помощь", KeyboardAction.Help)]);
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

export const notifyAdminsAboutSuggestion = async (
  suggestion: Suggestion,
  text?: string,
) => {
  for await (const id of adminIds) {
    await makeMessageToTg({
      chatId: id,
      text: `${text}\nId предложки: ${suggestion.id}`,
    });
  }
};

export const helpHtmlSuggestionScene =
  "<b>Отправить</b> предложку можно после добавления фотографий\nПосле отправки, через некоторое время Вам придёт уведомление, об одобрении или отказе в публикации\nТакже можно <b>возвратить</b> предложку, если Вы передумали или хотите доработать её";

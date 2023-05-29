import * as fs from "fs";
import axios from "axios";
import { Markup } from "telegraf";
import { Suggestion, SuggestionsFile, SuggestionStatus } from "./interfaces";
import { ENCODING_FORMAT, SUGGESTION_PATH } from "../../const";
import { MediaGroup } from "telegraf/typings/telegram-types";
import { PartialWithRequired } from "../../types/utils";

export enum KeyboardAction {
  Back = "Back",
  Photo = "Photo",
  Description = "Description",
  Show = "Show",
  Send = "Send",
  Delete = "Delete",
}

export const getSendRoomKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Добавить фотографии", KeyboardAction.Photo)],
    [Markup.button.callback("Добавить описание", KeyboardAction.Description)],
    [Markup.button.callback("Посмотреть", KeyboardAction.Show)],
    [Markup.button.callback("Отправить", KeyboardAction.Send)],
    [Markup.button.callback("Удалить", KeyboardAction.Delete)],
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

export const saveSuggestionInfo = async (suggestion: Suggestion) => {
  const suggestionFilePath = `${SUGGESTION_PATH}/suggestions.json`;
  const suggestionsListRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestionsList: SuggestionsFile = await JSON.parse(suggestionsListRaw);
  suggestionsList[suggestion.userId] = suggestion;
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestionsList));
};

export const getSuggestionInfo = async (userId: string | number) => {
  const suggestionFilePath = `${SUGGESTION_PATH}/suggestions.json`;
  const suggestionsListRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestionsList: SuggestionsFile = JSON.parse(suggestionsListRaw);
  return suggestionsList[Number(userId)];
};

export const updateSuggestionInfo = async (
  suggestion: PartialWithRequired<Suggestion, "userId">,
) => {
  const oldSuggestion = await getSuggestionInfo(suggestion.userId);
  await saveSuggestionInfo({ ...oldSuggestion, ...suggestion });
};

export const getSuggestionMediaGroupPost = async (userId: string | number) => {
  const existedSuggestionInfo = await getSuggestionInfo(userId);
  if (!existedSuggestionInfo || existedSuggestionInfo.fileIds.length === 0) {
    return false;
  }

  const mediaGroupPost: MediaGroup = existedSuggestionInfo.fileIds.map(
    (fileId, index) => {
      return index === 0
        ? {
            media: fileId,
            type: "photo",
            caption: existedSuggestionInfo.caption,
          }
        : { media: fileId, type: "photo" };
    },
  );
  return mediaGroupPost;
};

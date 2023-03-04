import * as fs from "fs";
import axios from "axios";
import { Markup } from "telegraf";
import { KeyboardAction } from "./";

import {
  Suggestion,
  SuggestionsFile,
  SuggestionStatus,
} from "../../types/interfaces";
import { ENCODING_FORMAT, SUGGESTION_PATH } from "../../const";
import { MediaGroup } from "telegraf/typings/telegram-types";

export const getSendRoomKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("Назад", KeyboardAction.Back)],
    [Markup.button.callback("Отправить", KeyboardAction.Send)],
    [Markup.button.callback("Удалить", KeyboardAction.Delete)],
  ]);

export const savePostInFolder = async (
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
  const suggestionsList: SuggestionsFile = JSON.parse(suggestionsListRaw);
  suggestionsList[suggestion.user_id] = suggestion;
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestionsList));
};

export const getSuggestionInfo = async (userId: string | number) => {
  const suggestionFilePath = `${SUGGESTION_PATH}/suggestions.json`;
  const suggestionsListRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestionsList: SuggestionsFile = JSON.parse(suggestionsListRaw);
  return suggestionsList[Number(userId)];
};

export const changeSuggestionStatus = async (
  userId: string | number,
  status: SuggestionStatus,
) => {
  const suggestion = await getSuggestionInfo(userId);
  await saveSuggestionInfo({ ...suggestion, status: status });
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

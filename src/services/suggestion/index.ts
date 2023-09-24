import * as fs from "fs";
import { MediaGroup } from "telegraf/typings/telegram-types";
import { PartialWithRequired } from "../../types/utils";
import { Suggestion, SuggestionsFile } from "../../types/suggestion";
import { ENCODING_FORMAT, ERRORS, SUGGESTION_PATH } from "../../const";

const suggestionFilePath = `${SUGGESTION_PATH}/suggestions.json`;

export const getSuggestionList = async () => {
  const suggestionsListRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestionsList: SuggestionsFile = JSON.parse(suggestionsListRaw);
  return suggestionsList;
};

export const saveSuggestionInfo = async (suggestion: Suggestion) => {
  const suggestionsList: SuggestionsFile = await getSuggestionList();
  suggestionsList[suggestion.userId] = suggestion;
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestionsList));
};

export const checkSuggestionInfo = async (userId: string | number) => {
  const suggestionsList: SuggestionsFile = await getSuggestionList();
  return Boolean(suggestionsList[Number(userId)]);
};

export const getSuggestionInfo = async (userId: string | number) => {
  const suggestionsList: SuggestionsFile = await getSuggestionList();
  if (!suggestionsList[Number(userId)]) {
    throw Error(ERRORS.EMPTY_SUGGESTION);
  }
  return suggestionsList[Number(userId)];
};

export const updateSuggestionInfo = async (
  suggestion: PartialWithRequired<Suggestion, "userId">,
) => {
  const oldSuggestion = await getSuggestionInfo(suggestion.userId);
  await saveSuggestionInfo({ ...oldSuggestion, ...suggestion });
};

export const deleteSuggestionInfo = async (userId: string | number) => {
  const suggestionsList = await getSuggestionList();
  delete suggestionsList[userId];
  console.log("suggestion list", suggestionsList)
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestionsList));
  return suggestionsList;
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

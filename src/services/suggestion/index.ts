import * as fs from "fs";
import { MediaGroup } from "telegraf/typings/telegram-types";
import { PartialWithRequired } from "../../types/utils";
import {
  Suggestion,
  SuggestionsFile,
  SuggestionStatus,
} from "../../types/suggestion";
import { ENCODING_FORMAT, ERRORS, SUGGESTION_PATH } from "../../const";

const suggestionFilePath = `${SUGGESTION_PATH}/suggestions.json`;

export const getSuggestions = async () => {
  const suggestionsRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestions: SuggestionsFile = JSON.parse(suggestionsRaw);
  return suggestions;
};

export const getSuggestionsByStatus = async (status: SuggestionStatus) => {
  const suggestions = await getSuggestions();
  return Object.values(suggestions)
    .filter((suggestion) => suggestion.status === status)
    .sort((a, b) => a.createdAt - b.createdAt);
};

export const saveSuggestionInfo = async (
  suggestion: Suggestion,
  userId?: number,
) => {
  const suggestions: SuggestionsFile = await getSuggestions();
  suggestions[userId || suggestion.userId] = suggestion;
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestions));
};

export const checkSuggestionInfo = async (userId: string | number) => {
  const suggestions: SuggestionsFile = await getSuggestions();
  return Boolean(suggestions[Number(userId)]);
};

export const getSuggestionInfo = async (userId: string | number) => {
  const suggestions: SuggestionsFile = await getSuggestions();
  if (!suggestions[Number(userId)]) {
    throw Error(ERRORS.EMPTY_SUGGESTION);
  }
  return suggestions[Number(userId)];
};

export const updateSuggestionInfo = async (
  suggestion: PartialWithRequired<Suggestion, "userId">,
) => {
  const oldSuggestion = await getSuggestionInfo(suggestion.userId);
  await saveSuggestionInfo({ ...oldSuggestion, ...suggestion });
};

export const deleteSuggestionInfo = async (userId: string | number) => {
  const suggestions = await getSuggestions();
  delete suggestions[userId];
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestions));
  return suggestions;
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

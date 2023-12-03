import * as fs from "fs";
import { MediaGroup } from "telegraf/typings/telegram-types";
import { PartialWithRequired } from "../../types/utils";
import {
  Suggestion,
  SuggestionsFile,
  SuggestionStatus,
} from "../../types/suggestion";
import { ENCODING_FORMAT, SUGGESTION_PATH } from "../../const";

type UserId = Suggestion["userId"];
type SuggestionId = Suggestion["id"];

const ACTIVE_SUGGESTION_STATUSES: SuggestionStatus[] = [
  "draft",
  "sent",
  "approved",
  "preparedForRefuse",
];

export const suggestionFileName = "suggestions.json";
export const suggestionFilePath = `${SUGGESTION_PATH}/${suggestionFileName}`;

export const getSuggestionFile = async () => {
  const suggestionsRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestionFile: SuggestionsFile = JSON.parse(suggestionsRaw);
  return suggestionFile;
};

export const updateSuggestionFile = async (file: SuggestionsFile) => {
  fs.writeFileSync(suggestionFilePath, JSON.stringify(file));
  return true;
};

export const getSuggestions = async () => {
  const suggestionsRaw = fs.readFileSync(suggestionFilePath, ENCODING_FORMAT);
  const suggestions: SuggestionsFile = JSON.parse(suggestionsRaw);
  return Object.values(suggestions).flat();
};

export const getSuggestionsByStatus = async (status: Suggestion["status"]) => {
  const suggestions = await getSuggestions();
  return suggestions
    .filter((suggestion) => suggestion.status === status)
    .sort((a, b) => a.createdAt - b.createdAt); // TODO remove sort?
};

export const getSuggestionsByUserId = async (userId: UserId) => {
  const suggestions = await getSuggestions();
  return suggestions.filter((suggestion) => suggestion.userId === userId);
};

export const getUserDraftSuggestion = async (userId: UserId) => {
  const userSuggestions = await getSuggestionsByUserId(userId);
  const draftSuggestion = userSuggestions.find((s) => s.status === "draft");
  return draftSuggestion;
};

export const getUserActiveSuggestion = async (userId: UserId) => {
  const userSuggestions = await getSuggestionsByUserId(userId);
  const activeSuggestion = userSuggestions.find((s) =>
    ACTIVE_SUGGESTION_STATUSES.includes(s.status),
  );
  return activeSuggestion;
};

export const getSuggestion = async (suggestionId: SuggestionId) => {
  const suggestion = (await getSuggestions()).find((s) => s.id === suggestionId);
  return suggestion;
};

export const saveSuggestion = async (suggestion: Suggestion, userId?: UserId) => {
  const id = userId || suggestion.userId;
  const userSuggestions = await getSuggestionsByUserId(id);
  const suggestionFile = await getSuggestionFile();

  const existedSuggestionIndex = userSuggestions.findIndex(
    (s) => s.id === suggestion.id,
  );
  if (existedSuggestionIndex > -1) {
    suggestionFile[id][existedSuggestionIndex] = suggestion;
    updateSuggestionFile(suggestionFile);
    return true;
  }

  suggestionFile[id] = [...userSuggestions, suggestion];
  updateSuggestionFile(suggestionFile);
  return true;
};

export const updateSuggestion = async (
  suggestion: PartialWithRequired<Suggestion, "id">,
) => {
  const oldSuggestion = await getSuggestion(suggestion.id);
  if (!oldSuggestion) return;
  const updatedSuggestion: Suggestion = { ...oldSuggestion, ...suggestion };
  await saveSuggestion(updatedSuggestion);
  return updatedSuggestion;
};

export const deleteSuggestions = async (userId: UserId) => {
  const suggestionFile = await getSuggestionFile();
  const updatedSuggestionFile = { ...suggestionFile, [userId]: [] };
  updateSuggestionFile(updatedSuggestionFile);
  return true;
};

export const deleteSuggestion = async (suggestionId: SuggestionId) => {
  const suggestionFile = await getSuggestionFile();
  const suggestion = await getSuggestion(suggestionId);
  if (!suggestion) return;
  const updatedSuggestionFile = {
    ...suggestionFile,
    [suggestion.userId]: suggestionFile[suggestion.userId].filter(
      (s) => s.id !== suggestionId,
    ),
  };
  updateSuggestionFile(updatedSuggestionFile);
  return true;
};

export const getSuggestionMediaGroupPost = async (suggestionId: SuggestionId) => {
  const existedSuggestion = await getSuggestion(suggestionId);

  if (!existedSuggestion) return;

  const mediaGroupPost: MediaGroup = existedSuggestion.fileIds.map(
    (fileId, index) => {
      return index === 0
        ? {
            media: fileId,
            type: "photo",
            caption: existedSuggestion.caption,
          }
        : { media: fileId, type: "photo" };
    },
  );
  return mediaGroupPost;
};

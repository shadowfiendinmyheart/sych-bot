import { Suggestion, SuggestionStatus } from "../types/suggestion";
import { PartialWithRequired } from "../types/utils";

export const getSuggestionStatusText = (status: SuggestionStatus) => {
  const textByStatus: { [k in SuggestionStatus]: string } = {
    draft: "Черновик",
    sent: "Отправлено на рассмотрение",
    approved: "Одобрено",
    posted: "Опубликовано",
    preparedForRefuse: "Подготовлено к отказу",
    refused: "Отказано",
  };

  return textByStatus[status];
};

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

export const generateSuggestionWithInitialFields = (
  suggestion: PartialWithRequired<Suggestion, "username" | "userId">,
): Suggestion => {
  return {
    fileIds: [],
    id: generateId(),
    status: "draft",
    caption: "",
    createdAt: Date.now(),
    ...suggestion,
  };
};

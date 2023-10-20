import { SuggestionStatus } from "../types/suggestion";

export const getSuggestionStatusText = (status: SuggestionStatus) => {
  const textByStatus: { [k in SuggestionStatus]: string } = {
    approved: "Одобрено",
    draft: "Черновик",
    new: "Готово к публикации",
    posted: "Опубликовано",
    preparedForRefuse: "Подготовлено к отказу",
    refused: "Отказано",
  };

  return textByStatus[status];
};

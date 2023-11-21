import { Markup } from "telegraf";
import { DescriptionKeyboard } from ".";
import { Suggestion } from "../../types/suggestion";

export const getIsAllowDescriptionDelete = (suggestion: Suggestion) =>
  suggestion.caption.length > 0;

export const getTextWithDescriptionSuggestionHint = (
  text: string,
  suggestion: Suggestion,
) =>
  `${text}\nВведите 'Назад', чтобы вернуться в предыдущее меню ${
    getIsAllowDescriptionDelete(suggestion)
      ? "\nВведите 'Удалить', если хотите удалить текущее описание"
      : ""
  }`;

export const getDescriptionSuggestionKeyboard = (suggestion: Suggestion) => {
  const buttons = [];
  if (getIsAllowDescriptionDelete(suggestion)) {
    buttons.push({ text: DescriptionKeyboard.Delete });
  }
  buttons.push({
    text: DescriptionKeyboard.Back,
  });

  return Markup.keyboard([buttons]).oneTime().resize();
};

export type SuggestionStatus =
  | "draft"
  | "new"
  | "preparedForRefuse"
  | "refused"
  | "approved"
  | "posted";

export interface Suggestion {
  status: SuggestionStatus;
  caption: string;
  userId: number;
  username: string;
  createdAt: number;
  fileIds: string[]; // хранит айдишники, по которым можно получить картинку через ctx.telegram.getFileLink
}

export type SuggestionsFile = { [userId: string]: Suggestion };

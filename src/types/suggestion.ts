export type SuggestionStatus =
  | "draft"
  | "sent"
  | "preparedForRefuse"
  | "refused"
  | "approved"
  | "posted";

export interface Suggestion {
  id: string;
  userId: number;
  username: string;
  status: SuggestionStatus;
  caption: string;
  createdAt: number;
  fileIds: string[]; // хранит айдишники, по которым можно получить картинку через ctx.telegram.getFileLink
}

export type SuggestionsFile = { [userId: string]: Suggestion[] };

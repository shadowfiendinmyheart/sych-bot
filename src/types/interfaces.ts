export interface IUserData {
  username: string;
}

export type SuggestionStatus =
  | 'new'
  | 'active'
  | 'canceled'
  | 'accepted'
  | 'posted';

export interface Suggestion {
  status: SuggestionStatus;
  caption: string;
  user_id: number;
  username: string;
  fileIds: string[]; // хранит айдишники, по которым можно получить картинку через ctx.telegram.getFileLink
}

export type SuggestionsFile = { [userId: string]: Suggestion };

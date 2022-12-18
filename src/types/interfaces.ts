export interface IUserData {
  username: string;
}

export type SuggestionStatus = 'active' | 'canceled' | 'accepted' | 'posted';

export interface Suggestion {
  status: SuggestionStatus;
  title: string;
  user_id: string;
  username: string;
  fileNames: string[];
}

export type SuggestionsFile = { [userId: string]: Suggestion };

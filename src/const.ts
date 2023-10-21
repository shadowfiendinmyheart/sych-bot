import * as path from "path";

export const API_URL = "";
export const MAX_TG_MESSAGE_LENGTH = 900;

export const SUGGESTION_PATH = path.join(__dirname, "../public/suggestions");
export const POSTS_PATH = path.join(__dirname, "../public/posts");
export const POSTS_FILE_NAME = "posts.json";
export const SORTED_POSTS_FILE_NAME = "sortedPosts.json";
export const PATHS = [SUGGESTION_PATH, POSTS_PATH];

export const ENCODING_FORMAT = "utf-8";

export const ERRORS = {
  WRONG_STATUS_SUGGESTION: "wrong status suggestion error",
  EMPTY_SUGGESTION: "empty suggestion error",
  EMPTY_USER_SUGGESTIONS: "empty user suggestions error",
  ADMIN_EMPTY_SUGGESTION: "adming empty suggestion error",
};

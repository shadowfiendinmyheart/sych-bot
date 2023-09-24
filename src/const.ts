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
  EMPTY_SUGGESTION: "empty suggestion",
};

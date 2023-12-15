import * as path from "path";

export const API_URL = "";
export const MAX_TG_MESSAGE_LENGTH = 900;

export const SUGGESTION_PATH = path.join(__dirname, "../public/suggestions");
export const STATS_PATH = path.join(__dirname, "../public/stats");
export const POSTS_PATH = path.join(__dirname, "../public/posts");
export const SUGGESTION_FILE_NAME = "suggestions.json";
export const STATS_FILE_NAME = "stats.json";
export const POSTS_FILE_NAME = "posts.json";
export const SORTED_POSTS_FILE_NAME = "sortedPosts.json";
export const PATHS = [SUGGESTION_PATH, POSTS_PATH, STATS_PATH];
export const FILES = [STATS_FILE_NAME, POSTS_FILE_NAME, SORTED_POSTS_FILE_NAME];

export const ENCODING_FORMAT = "utf-8";

export const ERRORS = {
  WRONG_STATUS_SUGGESTION: "wrong status suggestion error",
  EMPTY_SUGGESTION: "empty suggestion error",
  ADMIN_EMPTY_SUGGESTION: "adming empty suggestion error",
  SAVE_SUGGESTION: "save suggestion error",
  GET_VK_POST: "get vk post error",
  GET_RANDOM_VK_POST: "get random vk post error",
};

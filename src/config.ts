import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, "..", `.${process.env.NODE_ENV}.env`),
});

const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  VK_API_TOKEN: process.env.VK_API_TOKEN,
  VK_GROUP_ID: process.env.VK_GROUP_ID,
  VK_POST_LINK: process.env.VK_POST_LINK,
  TG_GROUP_ID: process.env.TG_GROUP_ID,
};

export default config;

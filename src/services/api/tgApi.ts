import axios from "axios";
import { Markup } from "telegraf";
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import config from "../../config";

interface TgPost {
  text?: string;
  photos?: string[];
}

interface SendMessageParams {
  chatId: string;
  text: string;
  parseMode?: string;
  replyMarkup?: Markup.Markup<InlineKeyboardMarkup>;
}

export const tgRequest = async (method: string, body: object) => {
  try {
    const tgResponse = await axios.post(
      `https://api.telegram.org/bot${config.BOT_TOKEN}/${method}`,
      body,
    );
    if (!tgResponse.data.ok) {
      console.log("tgResponse is not ok", tgResponse.data);
      return;
    }
    return tgResponse.data;
  } catch (e: any) {
    console.log("tg request error:", e);
  }
};

export const makePostToTg = async (post: TgPost, chatId?: string) => {
  const photos = post.photos?.map((photo, index) => {
    const media = {
      type: "photo",
      media: photo,
    };
    return index !== 0 ? media : { caption: post.text, ...media };
  });
  const tgResponse = await tgRequest("sendMediaGroup", {
    chat_id: chatId || config.TG_GROUP_ID,
    caption: post.text,
    media: photos,
    parse_mode: "HTML",
  });
  return tgResponse;
};

export const makeMessageToTg = async (params: SendMessageParams) => {
  const tgResponse = await tgRequest("sendMessage", {
    ...params,
    parse_mode: params.parseMode || "HTML",
    chat_id: params.chatId,
    reply_markup: params.replyMarkup?.reply_markup,
  });
  return tgResponse;
};

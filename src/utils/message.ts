import { Context, Telegram } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { Message } from "typegram";
import config from "../config";
import { MAX_TG_MESSAGE_LENGTH } from "../const";
import { logger } from "../scenes/utils";
import awaiter from "./awaiter";

const telegram: Telegram = new Telegram(config.BOT_TOKEN as string);

export const deleteUserMessage = async (ctx: Context) => {
  try {
    if (ctx.message) {
      const messageId: number = ctx.message.message_id;
      await ctx.deleteMessage(messageId);
    }
  } catch (e) {
    console.log(e);
  }
};

export const deleteChatMessage = async (message: Message) => {
  try {
    await telegram.deleteMessage(message.chat.id, message.message_id);
  } catch (e) {
    console.log(e);
  }
};

export const editChatMessage = async (
  message: Message.TextMessage,
  text: string,
  keyboard?: ExtraEditMessageText,
) => {
  try {
    await telegram.editMessageText(
      message.chat.id,
      message.message_id,
      "",
      text,
      keyboard,
    );
  } catch (e) {
    console.log(e);
  }
};

export const getMessageWithSourceLink = (message: string, link: string) => {
  const postText =
    message.length > MAX_TG_MESSAGE_LENGTH
      ? message.slice(0, MAX_TG_MESSAGE_LENGTH) + "..."
      : message;
  const messageWithLink = `${postText}\n\n<a href="${link}">Источник с комментариями</a>`;
  return messageWithLink;
};

export const editMessageCaption = async (
  messageId: number,
  newCaption: string,
  chatId?: string,
) => {
  await telegram.editMessageCaption(
    String(chatId || config.TG_GROUP_ID),
    messageId,
    undefined,
    newCaption,
    { parse_mode: "HTML" },
  );
};

export const chatLogger = async (
  ctx: Context,
  message: string,
  timeMessageAlive = 60000,
) => {
  try {
    logger(ctx, message, "message from chatLogger");
    const infoMessage = await ctx.reply(message);
    await awaiter(timeMessageAlive);
    await ctx.deleteMessage(infoMessage.message_id);
  } catch (error) {
    console.log("chat logger error:", error);
  }
};

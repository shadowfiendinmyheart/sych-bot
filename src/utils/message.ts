import { Context, Telegram } from "telegraf";
import { ExtraEditMessageText } from "telegraf/typings/telegram-types";
import { Message } from "typegram";
import awaiter from "./awaiter";

const telegram: Telegram = new Telegram(process.env.BOT_TOKEN as string);

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
  keyboard?: ExtraEditMessageText
) => {
  try {
    await telegram.editMessageText(
      message.chat.id,
      message.message_id,
      "",
      text,
      keyboard
    );
  } catch (e) {
    console.log(e);
  }
};

export const editMessage = async (ctx: Context, newText: string) => {
  try {
    await deleteUserMessage(ctx);
    await ctx.replyWithHTML(newText);
  } catch (e) {
    console.log(e);
  }
};

export const chatLogger = async (
  ctx: Context,
  message: string,
  timeMessageAlive = 10000
) => {
  const errorMessage = await ctx.reply(message);
  await awaiter(timeMessageAlive);
  await ctx.deleteMessage(errorMessage.message_id);
  console.log(message);
};

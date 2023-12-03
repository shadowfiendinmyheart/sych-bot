import { Context, Markup } from "telegraf";
import { KeyboardAction } from ".";
import { checkIsAdmin } from "../../utils/user";

export const getMenuKeyboard = (ctx: Context) => {
  const userId = ctx.from?.id;
  const isAdmin = checkIsAdmin(userId || 0);

  const buttons = [
    [Markup.button.callback("Предложка", KeyboardAction.Suggestion)],
    [
      Markup.button.callback(
        "Получить рандомный пост из паблика VK",
        KeyboardAction.GetRandomVkPost,
      ),
    ],
  ];
  if (isAdmin) {
    buttons.push([
      Markup.button.callback("Админка", KeyboardAction.Admin),
      Markup.button.callback("Репостер", KeyboardAction.Reposter),
    ]);
  }
  return Markup.inlineKeyboard(buttons);
};

interface UserRequest {
  timestamp: number;
}

const ONE_MINUTE = 60_000;
const userRequests: Record<number, UserRequest> = {};
export const isAllowToMakeRequest = (userId: number): boolean => {
  const now = Date.now();
  const userRequest = userRequests[userId];

  if (!userRequest) {
    userRequests[userId] = { timestamp: now };
    return true;
  }

  const userLastRequestTimestamp = userRequest.timestamp;
  if (now - userLastRequestTimestamp < ONE_MINUTE) return false;
  userRequests[userId] = { timestamp: now };
  return true;
};

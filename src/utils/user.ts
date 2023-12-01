export const adminIds = process.env.ADMIN_IDS?.split(",") || [];

export const checkIsAdmin = (userId: number) => adminIds.includes(String(userId));

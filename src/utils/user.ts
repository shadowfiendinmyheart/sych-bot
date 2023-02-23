export const adminIds = [625269183];

export const checkIsAdmin = (userId: number) => adminIds.includes(Number(userId));

import { getStatsFile, saveDayStats } from "./utils";

const uniqueUserIds = new Set<number>();
let dayInterval: NodeJS.Timer | null;

export const addUserId = (id: number) => {
  uniqueUserIds.add(id);
};

export const checkUserId = (id: number) => {
  return uniqueUserIds.has(id);
};

export const clearUserIds = () => {
  uniqueUserIds.clear();
};

export const startDayStats = () => {
  const DAY_IN_MS = 86_400_000;
  if (dayInterval) {
    console.log("day stats already start");
    return false;
  }
  dayInterval = setInterval(() => {
    const todayDate = new Date(Date.now());
    const result = saveDayStats(uniqueUserIds, todayDate);
    if (!result) return;
    clearUserIds();
  }, DAY_IN_MS);
  console.log("day stats started!!!");
  return true;
};

export const stopDayStats = () => {
  if (!dayInterval) {
    console.log("day stats already stop");
    return false;
  }
  clearInterval(dayInterval);
  dayInterval = null;
  return true;
};

export const getLast30DaysStats = () => {
  const statsFile = getStatsFile();
  const last30Days = Object.entries(statsFile.uniqueUsersByDays).slice(-30);
  return last30Days;
};

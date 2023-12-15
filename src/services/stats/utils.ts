import * as fs from "fs";
import { ENCODING_FORMAT, STATS_FILE_NAME, STATS_PATH } from "../../const";
import { StatsFile } from "../../types/stats";

export const statsFilePath = `${STATS_PATH}/${STATS_FILE_NAME}`;

export const getFormattedDate = (date: Date) => {
  const fullISODate = date.toISOString();
  // date example: 2011-10-05
  const onlyDate = fullISODate.substring(0, 10);
  return onlyDate;
};

export const getStatsFile = () => {
  const statsRaw = fs.readFileSync(statsFilePath, ENCODING_FORMAT);
  const statsFile: StatsFile = JSON.parse(statsRaw);
  return statsFile;
};

export const updateStatsFile = async (file: StatsFile) => {
  fs.writeFileSync(statsFilePath, JSON.stringify(file));
  return true;
};

export const saveDayStats = (userIds: Set<number>, todayDate: Date) => {
  const todayFormattedDate = getFormattedDate(todayDate);
  const statsFile = getStatsFile();
  if (statsFile.uniqueUsersByDays[todayFormattedDate]) return false;
  statsFile.uniqueUsersByDays[todayFormattedDate] = [...userIds];
  updateStatsFile(statsFile);
  return true;
};

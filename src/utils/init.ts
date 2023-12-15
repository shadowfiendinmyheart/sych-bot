import * as fs from "fs";
import { PATHS } from "../const";
import { statsFilePath } from "../services/stats/utils";
import { suggestionFilePath } from "../services/suggestion";
import { StatsFile } from "../types/stats";
import { SuggestionsFile } from "../types/suggestion";

const createFile = <InitFile>(path: string, initFile: InitFile) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(initFile));
    const fileName = path.split("/").slice(-1);
    console.log(`${fileName} — file created`);
  }
};

export const initFiles = () => {
  PATHS.forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
      console.log(`${path} — dir created`);
    }
  });

  createFile<SuggestionsFile>(suggestionFilePath, {});
  createFile<StatsFile>(statsFilePath, { uniqueUsersByDays: {} });
};

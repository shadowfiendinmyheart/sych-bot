import * as fs from "fs";
import { PATHS } from "../const";
import { suggestionFileName, suggestionFilePath } from "../services/suggestion";

export const initFiles = () => {
  PATHS.forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
      console.log(`${path} — dir created`);
    }
  });

  if (!fs.existsSync(suggestionFilePath)) {
    fs.writeFileSync(suggestionFilePath, "{}");
    console.log(`${suggestionFileName} — file created`);
  }
};

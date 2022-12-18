import * as fs from 'fs';
import axios from 'axios';
import { Markup } from 'telegraf';

import { KeyboardAction } from './types';
import { Suggestion, SuggestionsFile } from '../../types/interfaces';
import { suggestionFolderPath } from '../../const';

export const sendRoomKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Назад', KeyboardAction.Back)],
]);

export const savePostInFolder = async (
  href: string,
  folderPath: string,
  fileName: string
) => {
  const response = await axios({ url: href, responseType: 'stream' });
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(`${folderPath}/${fileName}.jpg`))
      .on('finish', () => {
        console.log('file saved!');
        resolve(true);
      })
      .on('error', (e: any) => {
        console.log(e);
        fs.rmSync(folderPath, { recursive: true, force: true });
        reject(e);
      });
  });
};

export const saveSuggestionInfo = async (suggestion: Suggestion) => {
  const suggestionFilePath = `${suggestionFolderPath}/suggestions.json`;
  const suggestionsListRaw = fs.readFileSync(suggestionFilePath, 'utf-8');
  const suggestionsList: SuggestionsFile = JSON.parse(suggestionsListRaw);
  suggestionsList[suggestion.user_id] = suggestion;
  fs.writeFileSync(suggestionFilePath, JSON.stringify(suggestionsList));
};

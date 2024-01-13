import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse';

export const loadCSV = async (filePath: string): Promise<string[][]> => {
  const data: string[][] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath.endsWith('.csv') ? filePath : `${filePath}.csv`)
      .on('error', (err) => reject(`${path.basename(filePath, '.csv')} ${err.message}`))
      .pipe(parse({ delimiter: ',', relax_column_count: true }))
      .on('data', (csvrow: string[]) => {
        if (data[0] && csvrow.length !== data[0].length) {
          const fixCsvrow: string[] = new Array(data[0].length).fill('');
          csvrow.forEach((cell, index) => (fixCsvrow[index] = cell));
          data.push(fixCsvrow);
        } else {
          data.push(csvrow);
        }
      })
      .on('end', () => resolve(data));
  });
};

export const getTextFileList = (projectPath: string, includeStudioTextsFile?: true) => {
  const paths = ['Data/Text/Dialogs', 'Data/Text/Studio'];
  const textFileList: number[] = [];
  paths.forEach((folderPath) => {
    if (!includeStudioTextsFile && folderPath === 'Data/Text/Studio') return;
    const filenames = fs
      .readdirSync(path.join(projectPath, folderPath))
      .filter((filename) => filename.endsWith('.csv'))
      .map((filename) => Number.parseInt(path.basename(filename, '.csv')))
      .filter((fileId) => !isNaN(fileId));
    textFileList.push(...filenames);
  });
  return textFileList;
};

export const addLineCSV = (newLine: string[], lineIndex: number, startId: number, csvData: string[][]) => {
  if (csvData[lineIndex] !== undefined) {
    csvData[lineIndex] = newLine;
  } else {
    const headersLength = csvData[0]?.length || 0;
    const countMissingLines = lineIndex - csvData.length;
    for (let index = 0; index < countMissingLines; index++) {
      const line = new Array(headersLength).fill(`[~${csvData.length - 1 + startId}]`);
      csvData.push(line);
    }
    csvData[lineIndex] = newLine;
  }
};

const isInRangeStudioText = (id: number) => id >= 200_000 && id < 300_000;

export const getTextPath = (id: number) => (isInRangeStudioText(id) ? 'Data/Text/Studio' : 'Data/Text/Dialogs');

/**
 * Check if 2xxxxx.csv files exist in Data/Text/Dialogs
 * @param textFileList The list of id of the text files
 * @param projectPath The path of the project
 * @returns True if 2xxxxx.csv files exist in Data/Text/Dialogs
 */
export const checkTextFileReserved = (textFileList: number[], projectPath: string) => {
  const textFileListFiltered = textFileList.filter(isInRangeStudioText);
  const dialogsPath = path.join(projectPath, 'Data/Text/Dialogs');
  return textFileListFiltered.reduce(async (prev, curr) => {
    const prevResult = await prev;
    return prevResult || fs.existsSync(path.join(dialogsPath, `${curr}.csv`));
  }, Promise.resolve(false));
};

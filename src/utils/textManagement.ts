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

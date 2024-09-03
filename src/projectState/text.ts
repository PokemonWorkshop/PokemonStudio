import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

type CSVRowByLanguage = Record<string, string[]>;
export type CSVHandler = ReturnType<typeof loadCSV>;

export const loadCSV = (fileId: number, projectPath: string, isSystemText: boolean) => {
  const filename = path.join(projectPath, 'Data/Text', isSystemText ? 'Studio' : 'Dialogs', `${fileId}.csv`);
  const csvRowsByLanguage = loadCSVContentByLanguage(filename);
  let tainted = false; // For now a boolean, might be interesting to have an history instead

  return {
    save: () => {
      if (tainted) save(csvRowsByLanguage, filename);
      tainted = false;
    },
    getColumn: (language: string) =>
      getLanguageColumn(csvRowsByLanguage, language, () => {
        tainted = true;
      }),
    setValue: (language: string, value: string, index: number) => {
      setValue(csvRowsByLanguage, language, value, index);
      tainted = true;
    },
    isTainted: () => tainted,
  };
};

const loadCSVContentByLanguage = (filename: string): CSVRowByLanguage => {
  const [header, ...rows] = parse(fs.readFileSync(filename, { encoding: 'utf-8' }), { delimiter: ',', relax_column_count: true }) as string[][];
  return header.reduce((record, language, index) => {
    const langId = language.trim().toLowerCase();
    if (langId === 'index') return record;

    record[langId] = rows.map((row) => row[index] ?? `[~${index}]`);
    return record;
  }, {} as CSVRowByLanguage);
};

const newLanguageColumn = (rows: CSVRowByLanguage, language: string) => {
  if (rows.en) {
    return rows.en.slice();
  }

  const length = Object.values(rows)[0]?.length ?? 0;
  return Array.from({ length }, (_, i) => `[~${i}]`);
};

const getLanguageColumn = (rows: CSVRowByLanguage, language: string, onAddedNewColumn: () => void): readonly string[] => {
  const column = rows[language];
  if (column) return column;

  const newColumn = (rows[language] = newLanguageColumn(rows, language));
  onAddedNewColumn();
  return newColumn;
};

const setValue = (rows: CSVRowByLanguage, language: string, value: string, index: number) => {
  if (index < 0) return;

  const column = rows[language] ?? newLanguageColumn(rows, language);
  if (index == column.length) {
    const newOtherValue = `[~${index}]`;
    Object.values(rows).forEach((c) => c.push(newOtherValue));
  } else if (index > column.length) {
    const { length } = column;
    const valuesToPush = Array.from({ length: index - length + 1 }, (_, i) => `[~${length + i}]`);
    Object.values(rows).forEach((c) => c.push(...valuesToPush));
  }

  column[index] = value;
};

const save = (rows: CSVRowByLanguage, filename: string) => {
  const header = Object.keys(rows);
  const output = [header];
  // This is subject to optimization
  header.forEach((langId) => {
    rows[langId].forEach((value, index) => {
      (output[index + 1] ??= []).push(value);
    });
  });
  fs.writeFileSync(filename, stringify(output));
};

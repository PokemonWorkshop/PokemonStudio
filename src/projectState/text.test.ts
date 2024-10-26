import fs from 'fs';
import { loadCSV, type CSVHandler } from './text';

jest.mock('fs');
const mockedReadFileSync = jest.mocked(fs.readFileSync);
const mockedWriteFileSync = jest.mocked(fs.writeFileSync);

describe('text', () => {
  beforeEach(() => {
    mockedReadFileSync.mockReset();
    mockedWriteFileSync.mockReset();
  });

  describe('without english column', () => {
    beforeEach(() => {
      mockedReadFileSync.mockReturnValueOnce('index,fr,de\n0,Text0,text0\n1,"Text,""1",text1\n');
    });

    it('loads the csv properly', () => {
      const handler = loadCSV(0, 'path', false);
      expect(mockedReadFileSync).toHaveBeenCalledWith('path/Data/Text/Dialogs/0.csv', { encoding: 'utf-8' });
      expect(handler.getColumn('fr')).toEqual(['Text0', 'Text,"1']);
    });

    it('loads the system csv properly', () => {
      const handler = loadCSV(0, 'path', true);
      expect(mockedReadFileSync).toHaveBeenCalledWith('path/Data/Text/Studio/0.csv', { encoding: 'utf-8' });
      expect(handler.getColumn('fr')).toEqual(['Text0', 'Text,"1']);
    });

    it('does not save if not modified', () => {
      const handler = loadCSV(0, 'path', false);
      expect(handler.isTainted()).toBeFalsy();
      handler.save();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });

    it('sets a value properly', () => {
      const handler = loadCSV(0, 'path', false);
      handler.setValue('fr', 'Text1', 1);
      expect(handler.isTainted()).toBeTruthy();
      handler.save();
      expect(handler.isTainted()).toBeFalsy();
      expect(mockedWriteFileSync).toHaveBeenCalledWith('path/Data/Text/Dialogs/0.csv', 'fr,de\nText0,text0\nText1,text1\n');
    });

    it('does not save if already saved and save if modified after last save', () => {
      const handler = loadCSV(0, 'path', false);
      handler.setValue('fr', 'Text1', 1);
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledTimes(1);
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledTimes(1);
      handler.setValue('fr', 'Text1', 1);
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledTimes(2);
    });

    it('adds placeholder in other columns when setting value at last row+1', () => {
      const handler = loadCSV(0, 'path', false);
      handler.setValue('fr', 'Text2', 2);
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledWith('path/Data/Text/Dialogs/0.csv', 'fr,de\nText0,text0\n"Text,""1",text1\nText2,[~2]\n');
    });

    it('adds placeholder text in all column until index of value when setting value way after last row', () => {
      const handler = loadCSV(0, 'path', false);
      handler.setValue('fr', 'Text4', 4);
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        'path/Data/Text/Dialogs/0.csv',
        'fr,de\nText0,text0\n"Text,""1",text1\n[~2],[~2]\n[~3],[~3]\nText4,[~4]\n'
      );
    });

    it('makes a new column with placeholder values when asking un-existing column', () => {
      const handler = loadCSV(0, 'path', false);
      handler.getColumn('it');
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledWith('path/Data/Text/Dialogs/0.csv', 'fr,de,it\nText0,text0,[~0]\n"Text,""1",text1,[~1]\n');
    });
  });

  describe('with english column', () => {
    it('makes a new column based on english one when asking for un-existing column', () => {
      mockedReadFileSync.mockReturnValueOnce('index,fr,en\n0,Text0,text0\n1,"Text,""1",text1\n');
      const handler = loadCSV(0, 'path', false);
      handler.getColumn('it');
      handler.save();
      expect(mockedWriteFileSync).toHaveBeenCalledWith('path/Data/Text/Dialogs/0.csv', 'fr,en,it\nText0,text0,text0\n"Text,""1",text1,text1\n');
    });
  });
});

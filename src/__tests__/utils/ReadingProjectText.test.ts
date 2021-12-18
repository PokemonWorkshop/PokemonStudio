import { ProjectText } from "@src/GlobalStateProvider";
import { getDialogMessage, getText } from "@utils/ReadingProjectText";
import i18next from "i18next";

const projectText: ProjectText = {
  9001: [['en', 'fr'], ['None', '???']],
  100000: [['en', 'fr', 'it'], ['Egg', 'Œuf', 'Uovo'], ['Bulbasaur', 'Bulbizarre', 'Bulbasaur']],
  100001: [],
  100002: [],
  100003: [],
  100004: [],
  100005: [],
  100006: [['en', 'fr', 'it'], ['---', '---', '---'], ['Pound', 'Écras’Face', 'Botta'], ['Karate Chop', 'Poing Karaté', 'Colpokarate']],
  100007: [],
  100008: [],
  100010: [],
  100012: [],
  100013: [],
  100015: [],
  100045: [],
  100046: []
};

describe('ReadingProjectText', () => {
  it('Get Bulbizarre', () => {
    i18next.language = "fr_FR";
    expect(getText(projectText, 0, 1)).toEqual('Bulbizarre');
  });
  it('Get Bulbasaur', () => {
    i18next.language = "en_US";
    expect(getText(projectText, 0, 1)).toEqual('Bulbasaur');
  });
  it('Get Colpokarate', () => {
    i18next.language = "it_IT";
    expect(getText(projectText, 6, 2)).toEqual('Colpokarate');
  });
  it('Csv not found', () => {
    i18next.language = "fr_FR";
    expect(getText(projectText, 50, 1)).toEqual('Unable to find dialog file 100050.');
  });
  it('Text not found', () => {
    i18next.language = "fr_FR";
    expect(getText(projectText, 6, 10)).toEqual('Unable to find text 10 in dialog file 100006.');
  });
  it('Test getDialogMessage', () => {
    i18next.language = "en_US";
    expect(getDialogMessage(projectText, 9001, 0)).toEqual('None');
  });
});

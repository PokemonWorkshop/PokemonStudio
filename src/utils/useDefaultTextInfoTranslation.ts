import { TFunction, useTranslation } from 'react-i18next';

/**
 * How to add a new translation?
 * 1) Add the id of the csv in the array KeyDefaultTextInfo
 * 2) Add the translation in the text_management.json files
 *
 * If we add a csv file 9002, the key for the json file for the name is 'text_info_name_9002'.
 * For the description, it is 'text_info_description_9002'. The description is optional.
 */

export const KeyDefaultTextInfo = [
  9001, 100000, 100001, 100002, 100003, 100004, 100005, 100006, 100007, 100008, 100010, 100011, 100012, 100013, 100014, 100015, 100016, 100017,
  100018, 100019, 100020, 100021, 100022, 100023, 100024, 100025, 100026, 100027, 100028, 100029, 100030, 100031, 100032, 100033, 100034, 100035,
  100036, 100037, 100038, 100039, 100040, 100041, 100042, 100043, 100044, 100045, 100046, 100047, 100048, 100049, 100055, 100056, 100061, 100062,
  100063, 100064,
] as const;
export type KeyDefaultTextInfoType = (typeof KeyDefaultTextInfo)[number];

const getDescription = (id: KeyDefaultTextInfoType, lang: string, t: TFunction<'text_management'>) => {
  // The description is optional, that is why we use 'never'
  const description = t(`text_info_description_${id}` as never, { lng: lang });
  return description === `text_info_description_${id}` ? '' : description;
};

export const useDefaultTextInfoTranslation = () => {
  const { t, i18n } = useTranslation('text_management');

  return () => {
    const allTextGeneric = i18n.languages.map((lang) => ({ lang, generic: t(`text_info_generic`, { lng: lang }) }));
    const allTextInfoTranslation = KeyDefaultTextInfo.map((id) => ({
      textId: id,
      names: i18n.languages.map((lang) => t(`text_info_name_${id}`, { lng: lang })),
      descriptions: i18n.languages.map((lang) => getDescription(id, lang, t)),
    }));
    return {
      textInfoGenerics: allTextGeneric,
      textInfoTranslations: allTextInfoTranslation,
    };
  };
};

export type UseDefaultTextInfoTranslationReturnType = {
  textInfoGenerics: { lang: string; generic: string }[];
  textInfoTranslations: { textId: KeyDefaultTextInfoType; names: string[]; descriptions: string[] }[];
};

import { TFunction } from 'i18next';

const MB_Limit = 1024 * 1024;

/**
 * Convert the download speed (the rate is in bytes) to KB or MB.
 */
export const downloadSpeed = (rate: number, t: TFunction<'loader'>) => {
  if (rate >= MB_Limit) return `${(rate / MB_Limit).toFixed(1)} ${t('MB')}/s`;

  return `${(rate / 1024).toFixed(1)} ${t('KB')}/s`;
};

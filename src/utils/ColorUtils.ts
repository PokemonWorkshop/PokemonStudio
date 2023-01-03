import { StudioBallItem } from '@modelEntities/item';

/**
 * Convert color to hex
 * @param color The color to convert
 * @returns The color converted to hex
 */
export const colorToHex = (color: StudioBallItem['color']) => {
  const r = (color.red < 16 ? '0' : '') + color.red.toString(16);
  const g = (color.green < 16 ? '0' : '') + color.green.toString(16);
  const b = (color.blue < 16 ? '0' : '') + color.blue.toString(16);

  return `#${r}${g}${b}`;
};

/**
 * Convert hex color to color
 * @param hex The hex value to convert
 * @returns The hex converted to color
 */
export const hexToColor = (hex: string): StudioBallItem['color'] => {
  return {
    red: parseInt(hex.slice(1, 3), 16),
    green: parseInt(hex.slice(3, 5), 16),
    blue: parseInt(hex.slice(5, 7), 16),
    alpha: 255,
  };
};

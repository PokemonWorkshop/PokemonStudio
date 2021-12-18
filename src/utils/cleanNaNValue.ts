/**
 * Replace NaN value by 0 or for the value given
 * @param value The value from which we want to remove NaN
 * @param replaceBy Replace NaN value by the value given. By default, the value is 0.
 * @returns The value without NaN
 */
export const cleanNaNValue = (value: number, replaceBy?: number) => {
  return isNaN(value) ? replaceBy || 0 : value;
};

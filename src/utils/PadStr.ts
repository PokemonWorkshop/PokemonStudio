/**
 * Convert a number to string with the number of digits specified.
 * @param value The number to convert
 * @param size The number of digits
 * @returns The string of number with the number of digits specified
 */
export const padStr = (value: number, size: number) => {
  let checkValue = value;
  if (checkValue < 0) checkValue *= -1;
  if (checkValue.toString().length > size) return value.toString();
  const sign = Math.sign(value) === -1 ? '-' : '';
  return (
    sign +
    new Array(size)
      .concat([Math.abs(value)])
      .join('0')
      .slice(-size)
  );
};

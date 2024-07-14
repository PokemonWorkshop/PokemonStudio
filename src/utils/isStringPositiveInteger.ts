const IS_POSITIVE_INTEGER_REG = /^\d$/;
export const isStringPositiveInteger = (value: string) => IS_POSITIVE_INTEGER_REG.test(value);

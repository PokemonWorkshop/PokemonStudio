export const join = (...strs: string[]): string => {
  return strs.reduce((previousValue, str, index) => {
    const newStr = str
      .replaceAll('\\', '/')
      .split('/')
      .filter((s) => s !== '')
      .join('/');
    if (index === 0) return newStr;
    return [previousValue, newStr].join('/');
  }, '');
};

export const basename = (str: string | undefined, stripExtension?: string): string => {
  if (!str) {
    return '';
  }

  let finalStr: string | undefined = str;

  if (stripExtension) {
    finalStr = finalStr.replaceAll(stripExtension, '');
  }

  finalStr = finalStr.replaceAll('\\', '/').split('/').pop();

  if (finalStr) {
    return finalStr;
  }

  return str;
};

export const stripExtension = (str: string | undefined): string => {
  if (!str) {
    return '';
  }

  return str.substring(0, str.lastIndexOf('.'));
};

export const dirname = (str: string | undefined): string => {
  if (!str) return '';

  const strSplited = str.replaceAll('\\', '/').split('/');
  strSplited.pop();
  return strSplited.join('/');
};

export const join = (...strs: string[]): string => {
  if (strs.filter((str) => str.includes('\\')).length) {
    return strs.join('\\').replaceAll('/', '\\');
  }

  return strs.join('/').replaceAll('\\', '/');
};

export const basename = (str: string | undefined, strip_extension?: string): string => {
  if (!str) {
    return '';
  }

  let final_str = str;

  if (strip_extension) {
    final_str = final_str.replaceAll(strip_extension, '');
  }

  final_str = final_str.replaceAll('\\', '/').split('/').pop();

  if (final_str) {
    return final_str;
  }

  return str;
};

export const strip_extension = (str: string | undefined): string => {
  if (!str) {
    return '';
  }

  return str.substring(0, str.lastIndexOf('.'));
};

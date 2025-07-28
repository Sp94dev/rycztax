type RemSize = string;

export const pixelsToRem = (px: number, rem: number = 16): RemSize => {
  if (px === 0 || rem === 0) {
    return '0';
  }
  return px / rem + 'rem';
};

export const css = (strings: TemplateStringsArray, ...args: any[]) =>
  String.raw({ raw: strings }, ...args);

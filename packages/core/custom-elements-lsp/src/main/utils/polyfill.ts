export const polyFill = () => {
  // @ts-expect-error
  if (!String.prototype.replaceAll) {
    // @ts-expect-error
    String.prototype.replaceAll = function (str: string | RegExp, newStr: string) {
      // If a regex pattern
      if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
        return this.replace(str, newStr);
      }

      // If a string
      return this.replace(new RegExp(str, 'g'), newStr);
    };
  }
};

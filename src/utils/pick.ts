export const pick = (obj: Record<string, unknown>, keys: string[]) => {
  const finalObj: Record<string, unknown> = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};
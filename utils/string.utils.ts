export const convertToArray = (payload: any) => {
  return payload
    .trim()
    .split('\n')
    .map((entry) => JSON.parse(entry));
};

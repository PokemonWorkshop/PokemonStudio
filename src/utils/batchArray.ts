export const batchArray = <T>(array: T[], batchSize: number): T[][] => {
  const batchCount = Math.ceil(array.length / batchSize);
  return Array.from({ length: batchCount }, (_, index) => array.slice(index * batchSize, (index + 1) * batchSize));
};

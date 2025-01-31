// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

/**
 * Merges the properties of the baseJson object into the targetJson object.
 * If a property in baseJson is an object, it will recursively merge its properties.
 * If a property in baseJson is a simple value and does not exist in targetJson, it will be added.
 *
 * @param {Object} baseJson - The base JSON object containing default properties.
 * @param {Object} targetJson - The target JSON object to be merged with baseJson properties.
 */
function mergeJson(baseJson, targetJson) {
  for (const key in baseJson) {
    if (typeof baseJson[key] === 'object' && !Array.isArray(baseJson[key])) {
      if (!targetJson[key]) {
        targetJson[key] = {};
      }
      mergeJson(baseJson[key], targetJson[key]);
    } else {
      // If the key is a simple value, add it if it is missing
      if (!Object.prototype.hasOwnProperty.call(targetJson, key)) {
        targetJson[key] = baseJson[key];
      }
    }
  }
}

const basePath = './assets/i18n/en.json';
const targetLanguages = ['fr', 'de', 'pt', 'it', 'es'];

try {
  const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf8'));

  targetLanguages.forEach((lang) => {
    const targetPath = `./assets/i18n/${lang}.json`;

    try {
      const targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

      mergeJson(baseJson, targetJson);

      fs.writeFileSync(targetPath, JSON.stringify(targetJson, null, 2), 'utf8');
      console.log(`Update completed for ${lang}.json: missing keys have been added.`);
    } catch (error) {
      console.error(`Error processing the file ${lang}.json:`, error);
    }
  });
} catch (error) {
  console.error('Error reading the base file en.json:', error);
}

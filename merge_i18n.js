// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

/**
 * Synchronizes targetJson with baseJson:
 * - Preserves the order of baseJson.
 * - Adds missing keys.
 * - Removes extra keys not present in baseJson.
 *
 * @param {Object} baseJson - The reference JSON object.
 * @param {Object} targetJson - The target JSON object to be updated.
 * @returns {boolean} - Returns true if any changes were made.
 */
function syncJson(baseJson, targetJson) {
  let hasChanges = false;
  const updatedJson = {};

  for (const key in baseJson) {
    if (typeof baseJson[key] === 'object' && !Array.isArray(baseJson[key])) {
      if (!targetJson[key] || typeof targetJson[key] !== 'object') {
        targetJson[key] = {};
        hasChanges = true;
      }
      hasChanges = syncJson(baseJson[key], targetJson[key]) || hasChanges;
    } else {
      if (!Object.prototype.hasOwnProperty.call(targetJson, key)) {
        targetJson[key] = baseJson[key];
        hasChanges = true;
      }
    }
    updatedJson[key] = targetJson[key]; // Keep the order from baseJson
  }

  // Remove extra keys that are not in baseJson
  Object.keys(targetJson).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(baseJson, key)) {
      hasChanges = true;
    }
  });

  // Replace targetJson with the cleaned-up version
  Object.keys(targetJson).forEach((key) => delete targetJson[key]);
  Object.assign(targetJson, updatedJson);

  return hasChanges;
}

const basePath = './assets/i18n/en.json';
const targetLanguages = ['fr', 'de', 'pt', 'it', 'es'];

try {
  const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf-8'));

  targetLanguages.forEach((lang) => {
    const targetPath = `./assets/i18n/${lang}.json`;

    try {
      const targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
      const originalJson = JSON.stringify(targetJson, null, 2);

      if (syncJson(baseJson, targetJson)) {
        const updatedJson = JSON.stringify(targetJson, null, 2);
        if (originalJson !== updatedJson) {
          fs.writeFileSync(targetPath, updatedJson, 'utf-8');
          console.log(`✅ ${lang}.json updated: synchronized with en.json.`);
        }
      } else {
        console.log(`✅ ${lang}.json is already up-to-date.`);
      }
    } catch (e) {
      console.error(`❌ Error processing ${lang}.json:`, e);
    }
  });
} catch (e) {
  console.error('❌ Error reading en.json:', e);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

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
    updatedJson[key] = targetJson[key];
  }

  Object.keys(targetJson).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(baseJson, key)) {
      hasChanges = true;
    }
  });

  Object.keys(targetJson).forEach((key) => delete targetJson[key]);
  Object.assign(targetJson, updatedJson);

  return hasChanges;
}

const basePath = './assets/i18n/en.json';
const i18nDir = './assets/i18n';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const targetLanguages = require('./package.json').languages || [];

try {
  const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf-8'));

  targetLanguages.forEach((lang) => {
    const targetPath = path.join(i18nDir, `${lang}.json`);
    let targetJson = {};
    let isNewFile = false;

    try {
      const content = fs.readFileSync(targetPath, 'utf-8');
      targetJson = JSON.parse(content);
    } catch {
      console.warn(`⚠️  ${lang}.json not found or invalid. Creating a new one.`);
      isNewFile = true;
    }

    if (syncJson(baseJson, targetJson) || isNewFile) {
      const updatedJson = JSON.stringify(targetJson, null, 2);
      fs.writeFileSync(targetPath, updatedJson, 'utf-8');
      console.log(`✅ ${lang}.json ${isNewFile ? 'created' : 'updated'}: synchronized with en.json.`);
    } else {
      console.log(`✅ ${lang}.json is already up-to-date.`);
    }
  });

  const files = fs.readdirSync(i18nDir);
  files.forEach((file) => {
    const ext = path.extname(file);
    const langCode = path.basename(file, ext);
    if (ext === '.json' && langCode !== 'en' && !targetLanguages.includes(langCode)) {
      fs.unlinkSync(path.join(i18nDir, file));
      console.log(`🗑️  Removed unused file: ${file}`);
    }
  });
} catch (e) {
  console.error('❌ Error reading en.json:', e);
}

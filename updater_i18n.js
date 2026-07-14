// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/**
 * Synchronizes the structure and content of a target JSON object with a base JSON object.
 * Ensures that all keys and nested objects in the base JSON are present in the target JSON.
 * Removes keys from the target JSON that are not present in the base JSON.
 *
 * @param {Object} baseJson - The base JSON object to synchronize from.
 * @param {Object} targetJson - The target JSON object to synchronize to.
 * @returns {boolean} - Returns `true` if any changes were made to the target JSON, otherwise `false`.
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
const languages = require('./package.json').languages || {};

try {
  const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf-8'));

  const allLangs = Object.keys(languages);
  const activeLangs = allLangs.filter((lang) => languages[lang]['active']);
  const inactiveLangs = allLangs.filter((lang) => !languages[lang]['active']);

  activeLangs.forEach((lang) => {
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
      fs.writeFileSync(targetPath, `${JSON.stringify(targetJson, null, 2)}\n`, 'utf-8');
      console.log(`✅ ${lang}.json ${isNewFile ? 'created' : 'updated'} (ACTIVE).`);
    } else {
      console.log(`✅ ${lang}.json is already up-to-date (ACTIVE).`);
    }
  });

  inactiveLangs.forEach((lang) => {
    const targetPath = path.join(i18nDir, `${lang}.json`);
    let targetJson = {};

    try {
      const content = fs.readFileSync(targetPath, 'utf-8');
      targetJson = JSON.parse(content);
    } catch {
      console.warn(`⚠️  ${lang}.json (INACTIVE) not found. Creating.`);
    }

    if (syncJson(baseJson, targetJson)) {
      fs.writeFileSync(targetPath, `${JSON.stringify(targetJson, null, 2)}\n`, 'utf-8');
      console.log(`📝 ${lang}.json updated (INACTIVE).`);
    }
  });

  const referencedLangs = new Set(allLangs.concat('en'));
  const files = fs.readdirSync(i18nDir);

  files.forEach((file) => {
    const ext = path.extname(file);
    const langCode = path.basename(file, ext);
    if (ext === '.json' && !referencedLangs.has(langCode)) {
      fs.unlinkSync(path.join(i18nDir, file));
      console.log(`🗑️  Removed unused file: ${file}`);
    }
  });
} catch (e) {
  console.error('❌ Error processing i18n files:', e);
}

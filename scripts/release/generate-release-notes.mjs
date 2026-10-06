import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const API_VERSION = process.env.GITHUB_API_VERSION || '2026-03-10';
const API_BASE_URL = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
const CHANGELOG_LABELS = ['changelog:addition', 'changelog:update', 'changelog:fix', 'changelog:skip'];
const NOT_READY_LABEL = 'changelog:notready';
const RELEASE_NOTE_START = '<!-- release-note:start -->';
const RELEASE_NOTE_END = '<!-- release-note:end -->';
const GENERATED_START = '<!-- generated-changelog:start -->';
const GENERATED_END = '<!-- generated-changelog:end -->';
const BACKLOG_REMINDER =
  'As a reminder, you can check the [GitHub product backlog](https://github.com/orgs/PokemonWorkshop/projects/1/views/1) before suggesting any new idea or feature, or if you just want to follow the progression.';

function envFlag(name, defaultValue = false) {
  const value = process.env[name];
  if (value === undefined || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function repositoryParts(repository) {
  const parts = repository.split('/');
  if (parts.length !== 2 || parts.some((part) => !part)) {
    throw new Error(`GITHUB_REPOSITORY must use the owner/repository format, received: ${repository}`);
  }
  return parts.map(encodeURIComponent);
}

async function githubApi(path, { method = 'GET', body } = {}) {
  const token = requireEnv('GITHUB_TOKEN');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'pokemon-studio-release-notes',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload?.message ? payload.message : text;
    throw new Error(`GitHub API ${method} ${path} failed (${response.status}): ${detail}`);
  }

  return payload;
}

async function readPackageVersion() {
  const packageJsonPath = resolve(process.env.PACKAGE_JSON_PATH || 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  if (typeof packageJson.version !== 'string' || !packageJson.version.trim()) {
    throw new Error(`${packageJsonPath} does not contain a valid version field.`);
  }
  return packageJson.version.trim();
}

async function findReleaseByTag(repository, tag) {
  const [owner, repo] = repositoryParts(repository);

  // The release-by-tag endpoint only returns published releases. Listing releases
  // with an authenticated token is required to discover drafts.
  for (let page = 1; page <= 20; page += 1) {
    const releases = await githubApi(`/repos/${owner}/${repo}/releases?per_page=100&page=${page}`);
    const match = releases.find((release) => release.tag_name === tag);
    if (match) return match;
    if (releases.length < 100) break;
  }

  return null;
}

function extractPullRequestNumbers(generatedBody) {
  const numbers = [];
  const seen = new Set();
  const pattern = /\/pull\/(\d+)(?=$|[\s)])/g;

  for (const match of generatedBody.matchAll(pattern)) {
    const number = Number(match[1]);
    if (!seen.has(number)) {
      seen.add(number);
      numbers.push(number);
    }
  }

  return numbers;
}

function extractMarkedContent(body, startMarker, endMarker) {
  if (!body) return '';
  const start = body.indexOf(startMarker);
  const end = body.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) return '';
  return body.slice(start + startMarker.length, end).trim();
}

function extractChangelogEntry(body) {
  const match = body?.match(/<!--\s*changelog:start\s*-->([\s\S]*?)<!--\s*changelog:end\s*-->/i);
  if (!match) return '';
  return match[1].trim().replace(/\s*\n+\s*/g, ' ');
}

function extractNewContributorLines(generatedBody) {
  const heading = '## New Contributors';
  const start = generatedBody.indexOf(heading);
  if (start === -1) return [];
  const contentStart = start + heading.length;
  const remainder = generatedBody.slice(contentStart);
  const nextSection = remainder.search(/^## |^\*\*Full Changelog\*\*:/m);
  const content = nextSection === -1 ? remainder : remainder.slice(0, nextSection);

  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\*\s+/.test(line) && /first contribution/i.test(line));
}

function extractFullChangelogUrl(generatedBody) {
  const match = generatedBody.match(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/compare\/[^\s)>*]+/);
  return match?.[0] || '';
}

function classifyPullRequest(pullRequest) {
  const labels = new Set(pullRequest.labels.map((label) => label.name));
  const categoryLabels = CHANGELOG_LABELS.filter((label) => labels.has(label));

  if (categoryLabels.length !== 1) {
    throw new Error(
      `#${pullRequest.number}: expected exactly one changelog category label (${CHANGELOG_LABELS.join(', ')}), found ${categoryLabels.length ? categoryLabels.join(', ') : 'none'}.`,
    );
  }

  const categoryLabel = categoryLabels[0];
  if (categoryLabel === 'changelog:skip') return { skip: true };

  const entry = extractChangelogEntry(pullRequest.body);
  if (!entry) {
    throw new Error(`#${pullRequest.number}: no text found between <!-- changelog:start --> and <!-- changelog:end -->.`);
  }

  return {
    skip: false,
    category: categoryLabel.slice('changelog:'.length),
    notReady: labels.has(NOT_READY_LABEL),
    entry,
  };
}

function renderCategory(title, entries) {
  if (!entries.length) return '';
  const bullets = entries
    .map(({ pullRequest, classification }) => `* ${classification.entry} by @${pullRequest.user.login} in ${pullRequest.html_url}`)
    .join('\n');
  return `### ${title}\n\n${bullets}`;
}

function renderCategoryGroup(entries) {
  return [
    renderCategory(':new: Additions', entries.addition),
    renderCategory(':arrows_counterclockwise: Updated', entries.update),
    renderCategory(':white_check_mark: Fixed', entries.fix),
  ].filter(Boolean);
}

function renderReleaseNotes({ tag, releaseNote, stable, notReady, newContributorLines, fullChangelogUrl }) {
  const version = tag.slice(1);
  const sections = [];

  sections.push(`## Pokémon Studio Changelog - Release ${version} 🏷️`);
  sections.push(`${RELEASE_NOTE_START}\n${releaseNote}\n${RELEASE_NOTE_END}`);
  sections.push(GENERATED_START);
  sections.push(...renderCategoryGroup(stable));

  const notReadySections = renderCategoryGroup(notReady);
  if (notReadySections.length) {
    sections.push(
      '## :soon: Version 3 changes - Not ready for production use',
      '*For now, this section is about version 3 features to come, only available in dev mode and __NOT READY__ for production use.*',
      ...notReadySections,
    );
  }

  sections.push(BACKLOG_REMINDER);

  if (newContributorLines.length) {
    sections.push(`## New Contributors\n\n${newContributorLines.join('\n')}`);
  }

  sections.push(`**Full Changelog**: ${fullChangelogUrl}`);
  sections.push(GENERATED_END);

  return `${sections.filter(Boolean).join('\n\n')}\n`;
}

export async function main() {
  const repository = requireEnv('GITHUB_REPOSITORY');
  const packageVersion = await readPackageVersion();
  const releaseTag = (process.env.RELEASE_TAG || `v${packageVersion}`).trim();
  const allowMissingDraft = envFlag('ALLOW_MISSING_DRAFT');
  const dryRun = envFlag('DRY_RUN');

  if (!releaseTag.startsWith('v')) {
    throw new Error(`RELEASE_TAG must start with "v", received: ${releaseTag}`);
  }
  if (releaseTag.slice(1) !== packageVersion) {
    throw new Error(`Release tag ${releaseTag} does not match package.json version ${packageVersion}.`);
  }

  const release = await findReleaseByTag(repository, releaseTag);
  if (!release) {
    if (allowMissingDraft) {
      console.log(`No release found for ${releaseTag}; nothing to update.`);
      return;
    }
    throw new Error(`No GitHub release found for ${releaseTag}. Create the draft release first.`);
  }

  if (!release.draft) {
    if (allowMissingDraft) {
      console.log(`Release ${releaseTag} is not a draft; leaving it unchanged.`);
      return;
    }
    throw new Error(`Release ${releaseTag} is already published. Refusing to replace its notes.`);
  }

  const [owner, repo] = repositoryParts(repository);
  const generateRequest = {
    tag_name: releaseTag,
    target_commitish: release.target_commitish,
  };
  if (process.env.PREVIOUS_TAG?.trim()) {
    generateRequest.previous_tag_name = process.env.PREVIOUS_TAG.trim();
  }

  const generated = await githubApi(`/repos/${owner}/${repo}/releases/generate-notes`, {
    method: 'POST',
    body: generateRequest,
  });

  const pullRequestNumbers = extractPullRequestNumbers(generated.body || '');
  const pullRequests = await Promise.all(pullRequestNumbers.map((number) => githubApi(`/repos/${owner}/${repo}/pulls/${number}`)));

  const stable = { addition: [], update: [], fix: [] };
  const notReady = { addition: [], update: [], fix: [] };
  const validationErrors = [];

  for (const pullRequest of pullRequests) {
    try {
      const classification = classifyPullRequest(pullRequest);
      if (classification.skip) continue;
      const target = classification.notReady ? notReady : stable;
      target[classification.category].push({ pullRequest, classification });
    } catch (error) {
      validationErrors.push(error.message);
    }
  }

  if (validationErrors.length) {
    throw new Error(`Changelog validation failed:\n- ${validationErrors.join('\n- ')}`);
  }

  const fullChangelogUrl =
    extractFullChangelogUrl(generated.body || '') ||
    (process.env.PREVIOUS_TAG?.trim() ? `https://github.com/${repository}/compare/${process.env.PREVIOUS_TAG.trim()}...${releaseTag}` : '');
  if (!fullChangelogUrl) {
    throw new Error('Unable to determine the full changelog comparison URL.');
  }

  const body = renderReleaseNotes({
    tag: releaseTag,
    releaseNote: extractMarkedContent(release.body, RELEASE_NOTE_START, RELEASE_NOTE_END),
    stable,
    notReady,
    newContributorLines: extractNewContributorLines(generated.body || ''),
    fullChangelogUrl,
  });

  if (dryRun) {
    console.log(`Release notes for ${releaseTag} are valid (dry run).`);
    return;
  }

  await githubApi(`/repos/${owner}/${repo}/releases/${release.id}`, {
    method: 'PATCH',
    body: { body },
  });
  console.log(`Updated draft release notes for ${releaseTag}.`);
}

const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectExecution) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

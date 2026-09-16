import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const API_VERSION = process.env.GITHUB_API_VERSION || '2026-03-10';
const API_BASE_URL = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
const DISCORD_LIMIT = 2_000;
const DISCORD_MARKER_PATTERN = /<!--\s*discord-publication:\s*(\{[\s\S]*?\})\s*-->/;
const GITHUB_BACKLOG_REMINDER =
  'As a reminder, you can check the [GitHub product backlog](https://github.com/orgs/PokemonWorkshop/projects/1/views/1) before suggesting any new idea or feature, or if you just want to follow the progression.';
const DISCORD_BACKLOG_REMINDER =
  'As a reminder, you can check the [GitHub product backlog](<https://github.com/orgs/PokemonWorkshop/projects/1/views/1>) before suggesting any new idea or feature, or if you just want to follow the progression.';

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${requireEnv('GITHUB_TOKEN')}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'pokemon-studio-discord-changelog',
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
    throw new HttpError(`GitHub API ${method} ${path} failed (${response.status}): ${detail}`, response.status);
  }

  return payload;
}

function webhookEndpoint(webhookUrl, messageId, waitForResponse = false) {
  const url = new URL(webhookUrl);
  url.pathname = `${url.pathname.replace(/\/$/, '')}${messageId ? `/messages/${encodeURIComponent(messageId)}` : ''}`;
  if (waitForResponse) url.searchParams.set('wait', 'true');
  return url;
}

async function discordApi(webhookUrl, { method, messageId, content }) {
  const response = await fetch(webhookEndpoint(webhookUrl, messageId, method === 'POST'), {
    method,
    headers: content === undefined ? {} : { 'Content-Type': 'application/json' },
    body:
      content === undefined
        ? undefined
        : JSON.stringify({
            content,
            allowed_mentions: { parse: [] },
            flags: 4,
          }),
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
    throw new HttpError(`Discord webhook request failed (${response.status}): ${detail}`, response.status);
  }

  return payload;
}

function findSection(markdown, heading) {
  const headingLine = `## ${heading}`;
  const start = markdown.indexOf(headingLine);
  if (start === -1) return null;

  const contentStart = start + headingLine.length;
  const remainder = markdown.slice(contentStart);
  const nextHeading = remainder.search(/^## |^\*\*Full Changelog\*\*:/m);
  const end = nextHeading === -1 ? markdown.length : contentStart + nextHeading;
  return { start, contentStart, end, content: markdown.slice(contentStart, end).trim() };
}

function formatContributorNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`;
}

export function toDiscordChangelog(releaseBody) {
  let body = releaseBody.replace(DISCORD_MARKER_PATTERN, '');
  body = body.replace(/<!--[\s\S]*?-->/g, '');
  body = body.replace('🏷️', ':label:');

  const contributorSection = findSection(body, 'New Contributors');
  if (contributorSection) {
    const names = [];
    const seen = new Set();
    for (const match of contributorSection.content.matchAll(/@([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))/g)) {
      if (!seen.has(match[1])) {
        seen.add(match[1]);
        names.push(match[1]);
      }
    }

    const replacement = names.length
      ? `## :sparkles: New Contributors\n\n* ${formatContributorNames(names)} made their first ${
          names.length === 1 ? 'contribution' : 'contributions'
        } in this version.\n\n`
      : '';
    body = `${body.slice(0, contributorSection.start)}${replacement}${body.slice(contributorSection.end)}`;
  }

  body = body.replace(/\s+by\s+@[A-Za-z0-9-]+\s+in\s+https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/(\d+)/g, ' (#$1)');
  body = body.replace(GITHUB_BACKLOG_REMINDER, '');
  body = body.replace(/(\*\*Full Changelog\*\*:\s*)<?(https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/compare\/[^\s)>*]+)>?/, '$1<$2>');

  body = body.replace(/\n{3,}/g, '\n\n').trim();
  return `${body}\n\n${DISCORD_BACKLOG_REMINDER}`;
}

function splitOversizedPiece(piece, limit) {
  const output = [];
  let current = '';

  for (const line of piece.split('\n')) {
    if (line.length > limit) {
      if (current) {
        output.push(current);
        current = '';
      }
      for (let index = 0; index < line.length; index += limit) {
        output.push(line.slice(index, index + limit));
      }
      continue;
    }

    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length <= limit) {
      current = candidate;
    } else {
      output.push(current);
      current = line;
    }
  }

  if (current) output.push(current);
  return output;
}

export function splitDiscordContent(content, limit = DISCORD_LIMIT) {
  const chunks = [];
  let current = '';

  const appendPiece = (piece) => {
    const candidate = current ? `${current}\n\n${piece}` : piece;
    if (candidate.length <= limit) {
      current = candidate;
      return;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (piece.length <= limit) {
      current = piece;
      return;
    }

    const splitPieces = splitOversizedPiece(piece, limit);
    chunks.push(...splitPieces.slice(0, -1));
    current = splitPieces.at(-1) || '';
  };

  for (const piece of content.trim().split(/\n{2,}/)) appendPiece(piece);
  if (current) chunks.push(current);

  if (!chunks.length || chunks.some((chunk) => chunk.length > limit)) {
    throw new Error('Unable to split the changelog within the Discord message limit.');
  }
  return chunks;
}

function parsePublicationMarker(body) {
  const match = body.match(DISCORD_MARKER_PATTERN);
  if (!match) return { messageIds: [], contentHash: '' };
  try {
    const marker = JSON.parse(match[1]);
    return {
      messageIds: Array.isArray(marker.messageIds) ? marker.messageIds.filter((id) => typeof id === 'string') : [],
      contentHash: typeof marker.contentHash === 'string' ? marker.contentHash : '',
    };
  } catch {
    throw new Error('The Discord publication marker in the release notes is invalid JSON.');
  }
}

function releaseBodyWithMarker(body, marker) {
  const cleanBody = body.replace(DISCORD_MARKER_PATTERN, '').trimEnd();
  return `${cleanBody}\n\n<!-- discord-publication: ${JSON.stringify(marker)} -->\n`;
}

export async function main() {
  const eventPath = resolve(requireEnv('GITHUB_EVENT_PATH'));
  const event = JSON.parse(await readFile(eventPath, 'utf8'));
  if (!event.release?.id) throw new Error('The GitHub event does not contain a release.');

  if (event.release.prerelease && !envFlag('PUBLISH_PRERELEASES')) {
    console.log('Prerelease detected; Discord publication skipped.');
    return;
  }

  const repository = process.env.GITHUB_REPOSITORY || event.repository?.full_name;
  if (!repository) throw new Error('Unable to determine the GitHub repository.');
  const webhookUrl = requireEnv('DISCORD_CHANGELOG_WEBHOOK_URL');
  const [owner, repo] = repositoryParts(repository);
  const release = await githubApi(`/repos/${owner}/${repo}/releases/${event.release.id}`);
  if (!release.body?.trim()) throw new Error('The published release does not contain release notes.');

  const discordBody = toDiscordChangelog(release.body);
  const chunks = splitDiscordContent(discordBody);
  const contentHash = createHash('sha256').update(chunks.join('\0')).digest('hex');
  const previousMarker = parsePublicationMarker(release.body);

  if (previousMarker.contentHash === contentHash && previousMarker.messageIds.length === chunks.length) {
    console.log('This changelog version has already been published to Discord.');
    return;
  }

  const messageIds = [...previousMarker.messageIds];
  const persistMarker = async () => {
    await githubApi(`/repos/${owner}/${repo}/releases/${release.id}`, {
      method: 'PATCH',
      body: {
        body: releaseBodyWithMarker(release.body, { messageIds, contentHash }),
      },
    });
  };

  for (let index = 0; index < chunks.length; index += 1) {
    const existingMessageId = messageIds[index];
    if (existingMessageId) {
      try {
        await discordApi(webhookUrl, {
          method: 'PATCH',
          messageId: existingMessageId,
          content: chunks[index],
        });
        continue;
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 404) throw error;
      }
    }

    const createdMessage = await discordApi(webhookUrl, {
      method: 'POST',
      content: chunks[index],
    });
    if (!createdMessage?.id) throw new Error('Discord did not return the created message ID.');
    messageIds[index] = createdMessage.id;
    await persistMarker();
  }

  for (const staleMessageId of messageIds.slice(chunks.length)) {
    try {
      await discordApi(webhookUrl, { method: 'DELETE', messageId: staleMessageId });
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 404) throw error;
    }
  }
  messageIds.length = chunks.length;
  await persistMarker();

  console.log(`Published the changelog to Discord in ${chunks.length} message(s).`);
}

const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectExecution) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

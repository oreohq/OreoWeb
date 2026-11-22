// Copy of the bot's renderer (OreoApp/src/shared/render/notification.ts) so the preview matches what it posts: only the import path, this comment & the PLATFORM_STYLES export differ.
import { pingRolesFor, type Content, type ContentType, type GuildCreator, type PlatformName } from '@/lib/api/types';


export type NotificationState = 'published' | 'live' | 'updated' | 'ended';

export const PLATFORM_STYLES: Record<PlatformName, { name: string; color: number }> = {
  youtube: { name: 'YouTube', color: 0xFF0033 },
  twitch: { name: 'Twitch', color: 0x9146FF },
  kick: { name: 'Kick', color: 0x53FC18 },
};

export const ENDED_COLOR = 0x4E5058;

export const CONTENT_LABELS: Record<ContentType, string> = {
  live: 'Livestream',
  video: 'Video',
  premiere: 'Premiere',
  shorts: 'Short',
  members: 'Members-only post',
};

const TYPE_TOKENS: Record<ContentType, string> = { live: 'live', video: 'video', premiere: 'premiere', shorts: 'shorts', members: 'members' };

const LIMITS = { content: 2000, title: 256, author: 256, description: 4096, footer: 2048, field: 1024 } as const;


export interface RenderedButton {
  style: 'link' | 'secondary';
  label: string;
  emoji?: string;
  url?: string;
  customId?: string;
  disabled?: boolean;
}

export interface RenderedEmbed {
  color: number;
  author: { name: string; iconUrl: string | null; url: string | null } | null;
  title: string | null;
  url: string | null;
  description: string | null;
  thumbnail: string | null;
  image: string | null;
  fields: Array<{ name: string; value: string; inline: boolean }>;
  footer: { text: string; iconUrl: string | null } | null;
  timestamp: string | null;
}

export interface RenderedMessage {
  content: string | null;
  embed: RenderedEmbed | null;
  buttons: RenderedButton[];
  allowedMentions: { parse: 'everyone'[]; roles: string[]; users: string[] };
  suppressNotifications: boolean;
}

interface RenderOptions {
  guildCreator: Pick<GuildCreator, 'id' | 'creator' | 'messages' | 'embed' | 'pingRoles' | 'pingOverrides' | 'watchButton' | 'notifyButton'>;
  content: Content;
  state: NotificationState;
  test?: boolean;
  now?: number;
  /** Footer icon links by platform */
  icons?: Partial<Record<PlatformName, string | null>>;
}

const NOTIFY_BUTTON_PREFIX = 'oreo:notify:';

export function notifyButtonId(guildCreatorId: number, type: ContentType): string {
  return `${NOTIFY_BUTTON_PREFIX}${guildCreatorId}:${type}`;
}

export function parseNotifyButtonId(customId: string): { guildCreatorId: number; type: ContentType | null } | null {
  const match = new RegExp(`^${NOTIFY_BUTTON_PREFIX}(\\d+)(?::(live|video|premiere|shorts|members))?$`).exec(customId);
  return match ? { guildCreatorId: Number(match[1]), type: (match[2] as ContentType | undefined) ?? null } : null;
}


type ValueKind = 'text' | 'url' | 'mention' | 'markup';
type Values = Record<string, { value: string; kind: ValueKind }>;

const PLACEHOLDER = /\{(video|channel|role)\.([a-z]+)\}/gi;


function buildValues({ guildCreator, content, state }: RenderOptions): Values {
  const creator = guildCreator.creator;
  // Once a stream has ended and its recording is out, the link people click is the recording
  const pingRoles = pingRolesFor(guildCreator, content.type);
  const link = state === 'ended' && content.type === 'live' && content.vodUrl ? content.vodUrl : content.url;
  const started = Math.floor((Date.parse(content.startedAt) || Date.now()) / 1000);
  const handle = (content.channel.username || creator.username).replace(/^@/, '');
  const text = (value: string | null | undefined) => ({ value: value ?? '', kind: 'text' as const });
  const url = (value: string | null | undefined) => ({ value: value ?? '', kind: 'url' as const });

  return {
    'video.id': text(content.id),
    'video.title': text(content.title),
    'video.link': url(link),
    'video.url': url(link),
    'video.type': text(TYPE_TOKENS[content.type]),
    'video.description': text(firstLine(content.description, 250)),
    'video.thumbnail': url(content.thumbnail),
    'video.category': text(content.category),
    'video.game': text(content.category),
    'video.uploadedago': { value: `<t:${started}:R>`, kind: 'markup' },
    'video.uploadedat': { value: `<t:${started}:f>`, kind: 'markup' },
    'channel.name': text(content.channel.displayName || creator.displayName),
    'channel.handle': text(handle ? `@${handle}` : ''),
    'channel.avatar': url(content.channel.avatarUrl ?? creator.avatarUrl),
    'channel.link': url(content.channel.url || creator.url),
    'channel.url': url(content.channel.url || creator.url),
    'channel.platform': text(PLATFORM_STYLES[creator.platform].name),
    'role.pingrole': { value: pingRoles.map((id) => `<@&${id}>`).join(' '), kind: 'mention' },
    'role.pingroles': { value: pingRoles.map((id) => `<@&${id}>`).join(' '), kind: 'mention' },
    'role.everyone': { value: '@everyone', kind: 'mention' },
    'role.here': { value: '@here', kind: 'mention' },
  };
}


/** Platform text can't mention anyone and is markdown-escaped. `plain` is for fields where Discord shows mentions raw. */
export function fillTemplate(template: string, values: Values, mode: 'markdown' | 'plain'): string {
  return template.replace(PLACEHOLDER, (match, group: string, name: string) => {
    const entry = values[`${group}.${name}`.toLowerCase()];
    if (!entry) return match;

    switch (entry.kind) {
      case 'url': return entry.value;
      case 'markup': return mode === 'markdown' ? entry.value : '';
      case 'mention': return mode === 'markdown' ? entry.value : '';
      case 'text': {
        const safe = neutralizeMentions(entry.value);
        return mode === 'markdown' ? escapeMarkdown(safe) : safe;
      }
    }
  });
}


export function neutralizeMentions(text: string): string {
  return text
    .replace(/@(everyone|here)/gi, '@\u200b$1')
    .replace(/<(@[!&]?|#)(\d{17,20})>/g, '<\u200b$1$2>');
}

export function escapeMarkdown(text: string): string {
  // every character that can open markup (links, quotes, spoilers, timestamps…) is escaped, not just known patterns
  return text
    .replace(/([\\*_~`|[\]()<>])/g, '\\$1')
    .replace(/^(\s*)(#{1,3} |-# |- |\d+\. )/gm, '$1\\$2');
}


/** Pings come from the admin-written template only. Nothing from the platform can add to them. */
export function mentionsFor(template: string, pingRoles: string[]): RenderedMessage['allowedMentions'] {
  const roles = new Set<string>();
  const users = new Set<string>();
  if (/\{role\.pingroles?\}/i.test(template)) for (const id of pingRoles) roles.add(id);
  for (const [, id] of template.matchAll(/<@&(\d{17,20})>/g)) roles.add(id!);
  for (const [, id] of template.matchAll(/<@!?(\d{17,20})>/g)) users.add(id!);
  const everyone = /\{role\.(everyone|here)\}|@(everyone|here)/i.test(template);

  return { parse: everyone ? ['everyone'] : [], roles: [...roles], users: [...users] };
}


export function renderNotification(options: RenderOptions): RenderedMessage {
  const { guildCreator, content, state, test = false } = options;
  const now = options.now ?? Date.now();
  const values = buildValues(options);
  const platform = PLATFORM_STYLES[guildCreator.creator.platform];

  const embed = renderEmbed(options, values, platform);
  // Members-only posts have no message of their own: they use the video one
  let template = guildCreator.messages[content.type === 'members' ? 'video' : content.type] ?? '';
  // Always say something: a blank message only works with an embed
  if (!template.trim() && !embed) template = '{role.pingrole} **{channel.name}** posted on {channel.platform}!\n<{video.link}>';

  const lines = [fillTemplate(template, values, 'markdown').trim()].filter(Boolean);
  if (state === 'ended' && content.type === 'live') lines.push(`-# ${endedLine(content, now)}`);
  if (test) lines.push('-# 🧪 Test notification from Oreo, nobody was pinged.');

  const text = truncate(lines.join('\n'), LIMITS.content) || null;

  return {
    content: text,
    embed,
    buttons: renderButtons(options, platform),
    allowedMentions: test ? { parse: [], roles: [], users: [] } : mentionsFor(template, pingRolesFor(guildCreator, content.type)),
    suppressNotifications: test,
  };
}


function renderEmbed(options: RenderOptions, values: Values, platform: (typeof PLATFORM_STYLES)[PlatformName]): RenderedEmbed | null {
  const { guildCreator, content, state } = options;
  const config = guildCreator.embed;
  if (!config.enabled) return null;

  const image = (template: string) => {
    const value = fillTemplate(template, values, 'plain').trim();
    return /^https?:\/\/\S+$/i.test(value) ? value : null;
  };
  const isStream = content.type === 'live';
  const ended = state === 'ended' && isStream;

  const authorName = truncate(fillTemplate(config.author, values, 'plain').trim(), LIMITS.author);
  const title = truncate(fillTemplate(config.title, values, 'markdown').trim(), LIMITS.title);
  const description = truncate(fillTemplate(config.description, values, 'markdown').trim(), LIMITS.description);
  const footerText = fillTemplate(config.footer, values, 'plain').trim();
  const thumbnail = image(config.thumbnail);
  const mainImage = image(config.image);
  // The live/ended status decorates an embed. It's not a reason to post one
  const hasContent = Boolean(authorName || title || description || thumbnail || mainImage || footerText || (config.showCategory && content.category));
  const status = isStream && hasContent ? (ended ? 'Stream ended' : 'Live now') : null;
  const footer = [footerText, status].filter(Boolean).join(' • ');

  const fields: RenderedEmbed['fields'] = [];
  if (config.showCategory && content.category) {
    fields.push({ name: isStream ? 'Playing' : 'Category', value: truncate(`**${escapeMarkdown(neutralizeMentions(content.category))}**`, LIMITS.field), inline: true });
  }
  if (ended && content.endedAt) {
    const duration = Date.parse(content.endedAt) - Date.parse(content.startedAt);
    if (duration > 0) fields.push({ name: 'Streamed for', value: `**${formatDuration(duration)}**`, inline: true });
  }

  const embed: RenderedEmbed = {
    color: ended ? ENDED_COLOR : (config.color ? parseInt(config.color.slice(1), 16) : platform.color),
    author: authorName ? { name: authorName, iconUrl: image(config.authorIcon), url: content.channel.url || guildCreator.creator.url } : null,
    title: title || null,
    url: title && config.linkTitle ? (ended && content.vodUrl ? content.vodUrl : content.url) : null,
    description: description || null,
    thumbnail,
    image: mainImage,
    fields,
    footer: footer ? { text: truncate(footer, LIMITS.footer), iconUrl: options.icons?.[guildCreator.creator.platform] ?? null } : null,
    timestamp: config.timestamp ? (ended && content.endedAt ? content.endedAt : content.startedAt) : null,
  };

  // Discord refuses empty embeds
  const hasBody = embed.author || embed.title || embed.description || embed.thumbnail || embed.image || embed.fields.length || embed.footer;
  return hasBody ? embed : null;
}


function renderButtons({ guildCreator, content, state, test }: RenderOptions, platform: (typeof PLATFORM_STYLES)[PlatformName]): RenderedButton[] {
  const buttons: RenderedButton[] = [];

  if (guildCreator.watchButton) {
    if (content.type === 'live' && state === 'ended') {
      buttons.push(content.vodUrl
        ? { style: 'link', label: 'Watch the VOD', url: content.vodUrl }
        : { style: 'link', label: `Visit on ${platform.name}`, url: content.channel.url || guildCreator.creator.url });
    } else {
      const label = { live: 'Watch Stream', video: 'Watch Video', premiere: 'Watch Premiere', shorts: 'Watch Short', members: 'Watch Members Post' }[content.type];
      buttons.push({ style: 'link', label, url: content.url });
    }
  }

  if (guildCreator.notifyButton && pingRolesFor(guildCreator, content.type).length && !test) {
    buttons.push({ style: 'secondary', label: 'Notify me', emoji: '🔔', customId: notifyButtonId(guildCreator.id, content.type) });
  }

  if (test) buttons.push({ style: 'secondary', label: 'Test notification', emoji: '🧪', customId: 'oreo:test', disabled: true });
  return buttons;
}


export const COUNTER_METRIC_LABELS = {
  subscribers: 'Subscribers',
  followers: 'Followers',
  videos: 'Videos',
  views: 'Views',
} as const;

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: value >= 1_000_000 ? 2 : 1,
  }).format(value);
}

/** `null` when there is no number, so the channel keeps its last good name. */
export function renderCounterName(template: string, data: { value: number | null; name: string; platform: PlatformName; metric: keyof typeof COUNTER_METRIC_LABELS }): string | null {
  if (data.value === null || !Number.isFinite(data.value)) return null;
  const name = template
    .replaceAll('{count}', formatCount(data.value))
    .replaceAll('{count.exact}', new Intl.NumberFormat('en').format(data.value))
    .replaceAll('{name}', data.name)
    .replaceAll('{platform}', PLATFORM_STYLES[data.platform].name)
    .replaceAll('{metric}', COUNTER_METRIC_LABELS[data.metric])
    .replace(/\s+/g, ' ')
    .trim();
  return name ? truncate(name, 100) : null;
}


/** `null` when the number is not in the name, so it cannot be kept up to date. */
export function counterTemplateFrom(name: string, data: { value: number | null; name: string }): string | null {
  if (data.value === null || !Number.isFinite(data.value)) return null;
  const exact = new Intl.NumberFormat('en').format(data.value);
  const template = name.includes(exact) ? name.replace(exact, '{count.exact}')
    : name.includes(formatCount(data.value)) ? name.replace(formatCount(data.value), '{count}') : null;
  if (!template) return null;
  const named = data.name.length > 1 ? template.replace(data.name, '{name}') : template;
  return named.length <= 90 ? named : null;
}


export function formatDuration(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  return [days && `${days}d`, hours && `${hours}h`, mins && !days && `${mins}m`].filter(Boolean).join(' ') || '1m';
}

function endedLine(content: Content, now: number): string {
  const ended = Math.floor((Date.parse(content.endedAt ?? '') || now) / 1000);
  return `Stream ended <t:${ended}:R>`;
}

function firstLine(text: string | null | undefined, max: number): string {
  const line = (text ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  return truncate(line, max);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

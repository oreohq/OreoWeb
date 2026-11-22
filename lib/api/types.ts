// A copy of the API's contract (common.types.ts) plus web-only shapes. Keep them in sync.

export type PlatformName = 'youtube' | 'twitch' | 'kick';
export type ContentType = 'live' | 'video' | 'premiere' | 'shorts' | 'members';
export type StreamEndAction = 'edit' | 'delete' | 'keep';
export type CounterMetric = 'subscribers' | 'followers' | 'videos' | 'views';
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';
export type SubscriptionStatus = 'pending' | 'active' | 'failed';

export const CONTENT_TYPES: readonly ContentType[] = ['live', 'video', 'premiere', 'shorts', 'members'];

export const PLATFORM_CONTENT_TYPES: Record<PlatformName, readonly ContentType[]> = {
  youtube: ['live', 'video', 'premiere', 'shorts', 'members'],
  twitch: ['live'],
  kick: ['live'],
};

export const MAX_PING_ROLES = 5;

export const PLATFORM_METRICS: Record<PlatformName, readonly CounterMetric[]> = {
  youtube: ['subscribers', 'videos', 'views'],
  twitch: ['followers'],
  kick: ['followers'],
};


export interface ApiChannel {
  platform: PlatformName;
  platformId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};


export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  category: string | null;
  startedAt: string;
  endedAt: string | null;
  vodUrl: string | null;
  channel: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    url: string;
  };
};


export interface Creator {
  id: string;
  platform: PlatformName;
  platformId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  url: string;
  subscriptionStatus: SubscriptionStatus;
};

export interface EmbedConfig {
  enabled: boolean;
  color: string | null;
  author: string;
  authorIcon: string;
  title: string;
  linkTitle: boolean;
  description: string;
  thumbnail: string;
  image: string;
  footer: string;
  timestamp: boolean;
  showCategory: boolean;
};

export type MessageTemplates = Record<ContentType, string>;

/** A kind's own list replaces the default roles for it, and an empty list pings no one */
export type PingOverrides = Partial<Record<ContentType, string[]>>;

export function pingRolesFor(creator: { pingRoles: string[], pingOverrides: PingOverrides }, type: ContentType): string[] {
  return creator.pingOverrides[type] ?? creator.pingRoles;
}

export function allPingRoles(creator: { pingRoles: string[], pingOverrides: PingOverrides }): string[] {
  return [...new Set([...creator.pingRoles, ...Object.values(creator.pingOverrides).flat()])];
}

export interface GuildCreator {
  id: number;
  guildId: string;
  creator: Creator;
  enabled: boolean;
  channelId: string | null;
  contentTypes: ContentType[];
  pingRoles: string[];
  pingOverrides: PingOverrides;
  publishPosts: boolean;
  messages: MessageTemplates;
  embed: EmbedConfig;
  watchButton: boolean;
  notifyButton: boolean;
  onStreamEnd: StreamEndAction;
  liveRoleId: string | null;
  liveUserId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export interface GuildCounter {
  id: number;
  guildId: string;
  creator: Creator;
  channelId: string;
  metric: CounterMetric;
  template: string;
  createdBy: string;
  createdAt: string;
};

export interface GuildLimits {
  premium: boolean;
  /** `null` with `premium` means lifetime */
  premiumUntil: string | null;
  premiumOnSale: boolean;
  slots: Record<PlatformName, { used: number, total: number }>;
  counters: { used: number, total: number };
};

export interface BotProfile {
  premium: boolean;
  applied: boolean;
  saved: { avatar: boolean, banner: boolean, at: string | null };
  nick: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  default: { username: string, avatarUrl: string | null };
  limits: { nick: number, bio: number, avatarBytes: number, bannerBytes: number };
};

export interface BotProfilePatch {
  nick?: string | null;
  bio?: string | null;
  avatar?: string | null;
  banner?: string | null;
};

export interface PremiumSummary {
  servers: { used: number, total: number };
  grants: PremiumGrantSummary[];
  assignments: PremiumAssignmentSummary[];
  purchaseUrl: string | null;
};

export interface PremiumGrantSummary {
  id: string;
  label: string;
  servers: number;
  source: 'kofi_shop' | 'kofi_membership' | 'manual';
  startsAt: string;
  expiresAt: string;
  active: boolean;
  renews: boolean;
};

export interface PremiumAssignmentSummary {
  guildId: string;
  assignedAt: string;
  active: boolean;
  premiumUntil: string | null;
  movableAt: string;
};

export interface GuildOverview {
  guildId: string;
  limits: GuildLimits;
  creators: GuildCreator[];
  counters: GuildCounter[];
  stats: { notifications: Record<PlatformName, number> };
};

export interface Delivery {
  id: string;
  guildCreatorId: number;
  platform: PlatformName;
  creatorName: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  url: string;
  channelId: string | null;
  messageId: string | null;
  status: DeliveryStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};



export interface SessionUser {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string;
};

export interface DashboardGuild {
  id: string;
  name: string;
  iconUrl: string | null;
  owner: boolean;
  botPresent: boolean;
  premium: boolean;
  /** `null` with `premium` means lifetime */
  premiumUntil: string | null;
};

export type ResourceChannelType = 'text' | 'announcement' | 'voice' | 'stage' | 'category' | 'forum';

export interface GuildResources {
  guild: { id: string, name: string, iconUrl: string | null };
  channels: Array<{
    id: string;
    name: string;
    type: ResourceChannelType;
    parentId: string | null;
    position: number;
    canSend: boolean;
    canManage: boolean;
  }>;
  roles: Array<{
    id: string;
    name: string;
    color: number;
    position: number;
    managed: boolean;
    mentionable: boolean;
    dangerous: boolean;
    assignable: boolean;
  }>;
  bot: { missing: string[] };
};

export interface GuildActivity {
  days: Array<{ date: string, youtube: number, twitch: number, kick: number, failed: number }>;
  totals: { sent: number, failed: number, skipped: number };
};

export type GuildLive = Array<{
  guildCreatorId: number;
  platform: PlatformName;
  content: { title: string, url: string, thumbnail: string | null, category: string | null, startedAt: string } | null;
}>;


export type ComponentStatus = 'operational' | 'degraded' | 'down';
export type ComponentGroup = 'core' | 'bot' | 'platforms';

export interface StatusComponent {
  id: string;
  name: string;
  group: ComponentGroup;
  status: ComponentStatus;
  detail: string | null;
};

export interface ServiceStatus {
  status: ComponentStatus;
  checkedAt: string;
  components: StatusComponent[];
  bot: {
    online: boolean;
    guilds: number;
    members: number;
    instances: Array<{
      id: string;
      shards: number[];
      shardCount: number;
      guilds: number;
      members: number;
      ping: number;
      memory: number;
      uptime: number;
      updatedAt: number;
    }>;
  };
  events: { length: number, groups: Array<{ name: string, pending: number, lag: number | null }> };
  creators: Partial<Record<PlatformName, number>>;
};

export interface StatusHistory {
  days: string[];
  components: Array<{
    id: string;
    name: string;
    group: ComponentGroup;
    uptime: number | null;
    days: Array<{ date: string, samples: number, degraded: number, down: number, uptime: number | null }>;
  }>;
};

export interface TestResult {
  status: 'pending' | 'sent' | 'failed';
  error?: string | null;
  messageUrl?: string | null;
};


export interface LookupResult extends ApiChannel {
  url: string;
};

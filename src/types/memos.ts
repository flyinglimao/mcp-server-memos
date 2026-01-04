/**
 * Memos API Types
 * Based on https://usememos.com/docs/api
 */

// Common types
export type State = 'STATE_UNSPECIFIED' | 'NORMAL' | 'ARCHIVED';
export type Visibility = 'VISIBILITY_UNSPECIFIED' | 'PRIVATE' | 'PROTECTED' | 'PUBLIC';
export type UserRole = 'ROLE_UNSPECIFIED' | 'HOST' | 'ADMIN' | 'USER';

// Instance configuration
export interface InstanceConfig {
  name: string;
  host: string;
  apiKey: string;
}

// Memo types
export interface Memo {
  name: string;
  state: State;
  creator: string;
  createTime: string;
  updateTime: string;
  displayTime: string;
  content: string;
  visibility: Visibility;
  tags: string[];
  pinned: boolean;
  attachments: Attachment[];
  relations: MemoRelation[];
  reactions: Reaction[];
  property?: MemoProperty;
  parent?: string;
  snippet?: string;
  location?: Location;
}

export interface MemoProperty {
  hasLink: boolean;
  hasTaskList: boolean;
  hasCode: boolean;
  hasIncompleteTasks: boolean;
}

export interface MemoRelation {
  memo: { name: string; snippet: string };
  relatedMemo: { name: string; snippet: string };
  type: string;
}

export interface Reaction {
  name: string;
  creator: string;
  contentId: string;
  reactionType: string;
  createTime: string;
}

export interface Location {
  placeholder: string;
  latitude: number;
  longitude: number;
}

export interface CreateMemoRequest {
  content: string;
  state?: State;
  visibility?: Visibility;
  pinned?: boolean;
  attachments?: string[];
  relations?: MemoRelation[];
}

export interface UpdateMemoRequest {
  content?: string;
  state?: State;
  visibility?: Visibility;
  pinned?: boolean;
  displayTime?: string;
}

export interface ListMemosRequest {
  pageSize?: number;
  pageToken?: string;
  state?: State;
  orderBy?: string;
  filter?: string;
  showDeleted?: boolean;
}

export interface ListMemosResponse {
  memos: Memo[];
  nextPageToken?: string;
}

// Attachment types
export interface Attachment {
  name: string;
  createTime: string;
  filename: string;
  content?: string;
  externalLink?: string;
  type: string;
  size: string;
  memo?: string;
}

export interface CreateAttachmentRequest {
  filename: string;
  type: string;
  content?: string;
  externalLink?: string;
  memo?: string;
}

export interface ListAttachmentsResponse {
  attachments: Attachment[];
}

// Shortcut types
export interface Shortcut {
  name: string;
  title: string;
  filter: string;
}

export interface CreateShortcutRequest {
  title: string;
  filter: string;
}

export interface ListShortcutsResponse {
  shortcuts: Shortcut[];
}

// User types
export interface User {
  name: string;
  role: UserRole;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  description?: string;
  state: State;
  createTime: string;
  updateTime: string;
}

export interface CreateUserRequest {
  username: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  password: string;
}

export interface ListUsersResponse {
  users: User[];
  nextPageToken?: string;
  totalSize?: number;
}

// Personal Access Token types
export interface PersonalAccessToken {
  name: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface CreatePersonalAccessTokenRequest {
  description?: string;
  expiresAt?: string;
}

export interface CreatePersonalAccessTokenResponse {
  personalAccessToken: PersonalAccessToken;
  token: string; // Only returned once upon creation
}

export interface ListPersonalAccessTokensResponse {
  personalAccessTokens: PersonalAccessToken[];
  nextPageToken?: string;
  totalSize?: number;
}

// Webhook types
export interface Webhook {
  name: string;
  url: string;
  displayName?: string;
  createTime: string;
  updateTime: string;
}

export interface CreateWebhookRequest {
  url: string;
  displayName?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  displayName?: string;
}

export interface ListWebhooksResponse {
  webhooks: Webhook[];
}

// User Setting types
export interface UserSetting {
  name: string;
  generalSetting?: GeneralSetting;
  webhooksSetting?: WebhooksSetting;
}

export interface GeneralSetting {
  locale?: string;
  memoVisibility?: string;
  theme?: string;
}

export interface WebhooksSetting {
  webhooks: Webhook[];
}

export interface ListUserSettingsResponse {
  settings: UserSetting[];
  nextPageToken?: string;
  totalSize?: number;
}

// Notification types
export interface UserNotification {
  name: string;
  // Add more fields as needed
}

export interface ListUserNotificationsResponse {
  notifications: UserNotification[];
  nextPageToken?: string;
}

// Instance types
export interface InstanceProfile {
  owner: string;
  version: string;
  mode: string;
  instanceUrl: string;
}

// Activity types
export interface Activity {
  name: string;
  creator: string;
  type: string;
  level: string;
  createTime: string;
  payload?: ActivityPayload;
}

export interface ActivityPayload {
  memoComment?: {
    memo: string;
    relatedMemo: string;
  };
}

export interface ListActivitiesResponse {
  activities: Activity[];
  nextPageToken?: string;
}

// API Error
export interface ApiError {
  code: number;
  message: string;
  details: unknown[];
}

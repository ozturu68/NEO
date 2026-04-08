/**
 * Matrix event types for type-safe wrapper layer
 */

/**
 * Base Matrix event with minimal fields
 */
export interface MatrixEvent<T = any> {
  event_id: string;
  room_id: string;
  sender: string;
  origin_server_ts: number;
  type: string;
  content: T;
}

/**
 * Room message event content
 */
export interface MessageEventContent {
  msgtype: 'm.text' | 'm.emote' | 'm.notice' | 'm.image' | 'm.file' | 'm.audio' | 'm.video';
  body: string;
  format?: 'org.matrix.custom.html';
  formatted_body?: string;
}

/**
 * Room message event
 */
export type MessageEvent = MatrixEvent<MessageEventContent>;

/**
 * Room member event content
 */
export interface MemberEventContent {
  membership: 'invite' | 'join' | 'leave' | 'ban';
  displayname?: string;
  avatar_url?: string;
}

/**
 * Room encryption event content
 */
export interface EncryptionEventContent {
  algorithm: 'm.megolm.v1.aes-sha2';
}

/**
 * Room creation event content
 */
export interface CreateEventContent {
  creator: string;
  'm.federate'?: boolean;
}

/**
 * Room topic event content
 */
export interface TopicEventContent {
  topic: string;
}

/**
 * Room name event content
 */
export interface NameEventContent {
  name: string;
}

/**
 * Reaction event content
 */
export interface ReactionEventContent {
  'm.relates_to': {
    rel_type: 'm.annotation';
    event_id: string;
    key: string;
  };
}

/**
 * Redaction event content
 */
export interface RedactionEventContent {
  reason?: string;
}

/**
 * Room summary for UI display
 */
export interface RoomSummary {
  roomId: string;
  name: string;
  topic?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount: number;
  isEncrypted: boolean;
  membership: 'invite' | 'join' | 'leave' | 'ban';
}

/**
 * User profile
 */
export interface UserProfile {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  presence?: 'online' | 'offline' | 'unavailable';
  lastActive?: number;
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  content_uri: string;
  file?: {
    name: string;
    size: number;
    type: string;
  };
}
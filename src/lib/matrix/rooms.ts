import { getMatrixClient } from './client';
import type { RoomSummary } from '../../types/matrix';
import { NotificationCountType, Room } from 'matrix-js-sdk';

export interface CreateRoomOptions {
  name: string;
  topic?: string;
  isEncrypted?: boolean;
  preset?: 'public_chat' | 'private_chat' | 'trusted_private_chat';
  invite?: string[];
}

/**
 * Create a new Matrix room
 */
export async function createRoom(options: CreateRoomOptions): Promise<string> {
  try {
    const client = getMatrixClient();
    
    const createOptions: any = {
      name: options.name,
      preset: options.preset || 'trusted_private_chat',
    };
    
    if (options.topic) {
      createOptions.topic = options.topic;
    }
    
    if (options.invite && options.invite.length > 0) {
      createOptions.invite = options.invite;
    }
    
    // E2EE is default in Neo
    if (options.isEncrypted !== false) {
      createOptions.initial_state = [
        {
          type: 'm.room.encryption',
          state_key: '',
          content: {
            algorithm: 'm.megolm.v1.aes-sha2',
          },
        },
      ];
    }
    
    const result = await client.createRoom(createOptions);
    return result.room_id;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw new Error('Oda oluşturulamadı: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Join a room by ID or alias
 */
export async function joinRoom(roomIdOrAlias: string): Promise<string> {
  try {
    const client = getMatrixClient();
    const room = await client.joinRoom(roomIdOrAlias);
    return room.roomId;
  } catch (error) {
    console.error('Failed to join room:', error);
    throw new Error('Odaya katılamadı: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId: string): Promise<void> {
  try {
    const client = getMatrixClient();
    await client.leave(roomId);
  } catch (error) {
    console.error('Failed to leave room:', error);
    throw new Error('Odadan ayrılamadı: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Invite user to room
 */
export async function inviteUser(roomId: string, userId: string): Promise<void> {
  try {
    const client = getMatrixClient();
    await client.invite(roomId, userId);
  } catch (error) {
    console.error('Failed to invite user:', error);
    throw new Error('Kullanıcı davet edilemedi: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Get list of rooms the user is in
 */
export async function getRooms(): Promise<RoomSummary[]> {
  try {
    const client = getMatrixClient();
    const rooms = client.getRooms();
    
    return rooms.map(room => {
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();
      const lastEvent = events.length > 0 ? events[events.length - 1] : null;
      
      return {
        roomId: room.roomId,
        name: room.name || room.roomId,
        topic: room.currentState.getStateEvents('m.room.topic')?.[0]?.getContent()?.topic,
        avatarUrl: room.getAvatarUrl(client.baseUrl, 64, 64, 'scale') || undefined,
        lastMessage: lastEvent?.getContent()?.body,
        lastMessageTimestamp: lastEvent?.getTs(),
        unreadCount: room.getUnreadNotificationCount(NotificationCountType.Total) || 0,
        isEncrypted: room.hasEncryptionStateEvent(),
        membership: room.getMyMembership() as 'invite' | 'join' | 'leave' | 'ban',
      };
    });
  } catch (error) {
    console.error('Failed to get rooms:', error);
    throw new Error('Odalar alınamadı: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Get room by ID
 */
export function getRoom(roomId: string): Room | null {
  try {
    const client = getMatrixClient();
    return client.getRoom(roomId);
  } catch (error) {
    console.error('Failed to get room:', error);
    throw new Error('Oda bilgisi alınamadı: ' + (error instanceof Error ? error.message : String(error)));
  }
}
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoom, joinRoom, inviteUser, leaveRoom, getRoom, getRooms } from './rooms';
import { getMatrixClient } from './client';
import { NotificationCountType } from 'matrix-js-sdk';

// Mock the client module
vi.mock('./client', () => ({
  getMatrixClient: vi.fn(),
}));

// Helper to create a mock room
function createMockRoom(roomId: string, name?: string) {
  const timelineEvents = [
    { getContent: () => ({ body: 'Last message' }), getTs: () => Date.now() }
  ];
  
  return {
    roomId,
    name: name || roomId,
    getLiveTimeline: vi.fn(() => ({
      getEvents: vi.fn(() => timelineEvents)
    })),
    currentState: {
      getStateEvents: vi.fn((type: string) => type === 'm.room.topic' ? [{
        getContent: () => ({ topic: 'Test topic' })
      }] : [])
    },
    getAvatarUrl: vi.fn(() => 'https://example.com/avatar.png'),
    getUnreadNotificationCount: vi.fn((type: NotificationCountType) => type === NotificationCountType.Total ? 5 : 0),
    hasEncryptionStateEvent: vi.fn(() => true),
    getMyMembership: vi.fn(() => 'join')
  };
}

describe('rooms', () => {
  const mockClient = {
    createRoom: vi.fn(),
    invite: vi.fn(),
    leave: vi.fn(),
    getRoom: vi.fn(),
    joinRoom: vi.fn(),
    getRooms: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getMatrixClient as any).mockReturnValue(mockClient);
  });

  describe('createRoom', () => {
    it('should create a room with default encryption', async () => {
      const roomId = '!test:example.com';
      mockClient.createRoom.mockResolvedValue({ room_id: roomId });

      const result = await createRoom({ name: 'Test Room', isEncrypted: true });

      expect(mockClient.createRoom).toHaveBeenCalledWith({
        name: 'Test Room',
        preset: 'trusted_private_chat',
        initial_state: [{
          type: 'm.room.encryption',
          state_key: '',
          content: { algorithm: 'm.megolm.v1.aes-sha2' },
        }],
      });
      expect(result).toBe(roomId);
    });

    it('should create a room without encryption when specified', async () => {
      const roomId = '!test2:example.com';
      mockClient.createRoom.mockResolvedValue({ room_id: roomId });

      const result = await createRoom({ name: 'Public Room', isEncrypted: false });

      expect(mockClient.createRoom).toHaveBeenCalledWith({
        name: 'Public Room',
        preset: 'trusted_private_chat',
      });
      expect(result).toBe(roomId);
    });

    it('should include topic and invite list when provided', async () => {
      const roomId = '!test3:example.com';
      mockClient.createRoom.mockResolvedValue({ room_id: roomId });

      const result = await createRoom({
        name: 'Group Chat',
        topic: 'Discussion about Neo',
        invite: ['@user1:example.com', '@user2:example.com'],
      });

      expect(mockClient.createRoom).toHaveBeenCalledWith({
        name: 'Group Chat',
        preset: 'trusted_private_chat',
        topic: 'Discussion about Neo',
        invite: ['@user1:example.com', '@user2:example.com'],
        initial_state: [{
          type: 'm.room.encryption',
          state_key: '',
          content: { algorithm: 'm.megolm.v1.aes-sha2' },
        }],
      });
      expect(result).toBe(roomId);
    });
  });

  describe('joinRoom', () => {
    it('should join a room by ID', async () => {
      const roomId = '!test:example.com';
      const mockRoom = { roomId };
      mockClient.joinRoom.mockResolvedValue(mockRoom);

      const result = await joinRoom(roomId);

      expect(mockClient.joinRoom).toHaveBeenCalledWith(roomId);
      expect(result).toBe(roomId);
    });
  });

  describe('inviteUser', () => {
    it('should invite a user to a room', async () => {
      const roomId = '!test:example.com';
      const userId = '@user:example.com';
      mockClient.invite.mockResolvedValue({});

      await inviteUser(roomId, userId);

      expect(mockClient.invite).toHaveBeenCalledWith(roomId, userId);
    });
  });

  describe('leaveRoom', () => {
    it('should leave a room', async () => {
      const roomId = '!test:example.com';
      mockClient.leave.mockResolvedValue({});

      await leaveRoom(roomId);

      expect(mockClient.leave).toHaveBeenCalledWith(roomId);
    });
  });

  describe('getRoom', () => {
    it('should return room from client', () => {
      const roomId = '!test:example.com';
      const mockRoom = { roomId, name: 'Test' };
      mockClient.getRoom.mockReturnValue(mockRoom);

      const result = getRoom(roomId);

      expect(mockClient.getRoom).toHaveBeenCalledWith(roomId);
      expect(result).toBe(mockRoom);
    });
  });

  describe('getRooms', () => {
    it('should return rooms from client', async () => {
      const mockRooms = [createMockRoom('!room1:example.com', 'Room 1'), createMockRoom('!room2:example.com', 'Room 2')];
      mockClient.getRooms.mockReturnValue(mockRooms);

      const result = await getRooms();

      expect(mockClient.getRooms).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        roomId: '!room1:example.com',
        name: 'Room 1',
        topic: 'Test topic',
        avatarUrl: 'https://example.com/avatar.png',
        lastMessage: 'Last message',
        unreadCount: 5,
        isEncrypted: true,
        membership: 'join'
      });
    });
  });
});
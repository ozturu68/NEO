import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessage, editMessage, redactMessage, reactToMessage, getMessages } from './messages';
import { getMatrixClient } from './client';
import { EventType, RelationType } from 'matrix-js-sdk';

// Mock the client module
vi.mock('./client', () => ({
  getMatrixClient: vi.fn(),
}));

describe('messages', () => {
  const mockClient = {
    sendEvent: vi.fn(),
    redactEvent: vi.fn(),
    getRoom: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getMatrixClient as any).mockReturnValue(mockClient);
  });

  describe('sendMessage', () => {
    it('should send a text message', async () => {
      const eventId = '$event123';
      mockClient.sendEvent.mockResolvedValue({ event_id: eventId });

      const result = await sendMessage({
        roomId: '!room:example.com',
        text: 'Hello world',
      });

      expect(mockClient.sendEvent).toHaveBeenCalledWith(
        '!room:example.com',
        EventType.RoomMessage,
        {
          msgtype: 'm.text',
          body: 'Hello world',
        }
      );
      expect(result).toBe(eventId);
    });

    it('should send a message with HTML', async () => {
      const eventId = '$event456';
      mockClient.sendEvent.mockResolvedValue({ event_id: eventId });

      const result = await sendMessage({
        roomId: '!room:example.com',
        text: 'Hello **world**',
        html: '<p>Hello <strong>world</strong></p>',
        msgtype: 'm.text',
      });

      expect(mockClient.sendEvent).toHaveBeenCalledWith(
        '!room:example.com',
        EventType.RoomMessage,
        {
          msgtype: 'm.text',
          body: 'Hello **world**',
          format: 'org.matrix.custom.html',
          formatted_body: '<p>Hello <strong>world</strong></p>',
        }
      );
      expect(result).toBe(eventId);
    });

    it('should send an emote message', async () => {
      const eventId = '$event789';
      mockClient.sendEvent.mockResolvedValue({ event_id: eventId });

      const result = await sendMessage({
        roomId: '!room:example.com',
        text: 'waves hello',
        msgtype: 'm.emote',
      });

      expect(mockClient.sendEvent).toHaveBeenCalledWith(
        '!room:example.com',
        EventType.RoomMessage,
        {
          msgtype: 'm.emote',
          body: 'waves hello',
        }
      );
      expect(result).toBe(eventId);
    });
  });

  describe('editMessage', () => {
    it('should edit a message', async () => {
      const eventId = '$newEvent123';
      mockClient.sendEvent.mockResolvedValue({ event_id: eventId });

      const result = await editMessage(
        '!room:example.com',
        '$oldEvent123',
        'Updated message'
      );

      expect(mockClient.sendEvent).toHaveBeenCalledWith(
        '!room:example.com',
        EventType.RoomMessage,
        {
          msgtype: 'm.text',
          body: 'Updated message',
          'm.new_content': {
            msgtype: 'm.text',
            body: 'Updated message',
          },
          'm.relates_to': {
            rel_type: RelationType.Replace,
            event_id: '$oldEvent123',
          },
        }
      );
      expect(result).toBe(eventId);
    });
  });

  describe('redactMessage', () => {
    it('should redact a message', async () => {
      mockClient.redactEvent.mockResolvedValue({});

      await redactMessage('!room:example.com', '$event123', 'Spam');

      expect(mockClient.redactEvent).toHaveBeenCalledWith(
        '!room:example.com',
        '$event123',
        'Spam'
      );
    });

    it('should redact a message without reason', async () => {
      mockClient.redactEvent.mockResolvedValue({});

      await redactMessage('!room:example.com', '$event123');

      expect(mockClient.redactEvent).toHaveBeenCalledWith(
        '!room:example.com',
        '$event123',
        undefined
      );
    });
  });

  describe('reactToMessage', () => {
    it('should react to a message', async () => {
      const eventId = '$reaction123';
      mockClient.sendEvent.mockResolvedValue({ event_id: eventId });

      const result = await reactToMessage(
        '!room:example.com',
        '$event123',
        '👍'
      );

      expect(mockClient.sendEvent).toHaveBeenCalledWith(
        '!room:example.com',
        EventType.Reaction,
        {
          'm.relates_to': {
            rel_type: RelationType.Annotation,
            event_id: '$event123',
            key: '👍',
          },
        }
      );
      expect(result).toBe(eventId);
    });
  });

  describe('getMessages', () => {
    it('should get messages from room', async () => {
      const mockEvents = [
        {
          getId: () => '$msg1',
          getRoomId: () => '!room:example.com',
          getSender: () => '@user:example.com',
          getTs: () => 1234567890,
          getType: () => 'm.room.message',
          getContent: () => ({ body: 'Hello' }),
        },
        {
          getId: () => '$msg2',
          getRoomId: () => '!room:example.com',
          getSender: () => '@user2:example.com',
          getTs: () => 1234567891,
          getType: () => 'm.room.message',
          getContent: () => ({ body: 'World' }),
        },
      ];
      const mockRoom = {
        getLiveTimeline: vi.fn(() => ({
          getEvents: vi.fn(() => mockEvents),
        })),
      };
      mockClient.getRoom.mockReturnValue(mockRoom);

      const result = await getMessages('!room:example.com', 2);

      expect(mockClient.getRoom).toHaveBeenCalledWith('!room:example.com');
      expect(result).toHaveLength(2);
      expect(result[0].event_id).toBe('$msg1');
      expect(result[0].room_id).toBe('!room:example.com');
      expect(result[0].sender).toBe('@user:example.com');
    });

    it('should throw if room not found', async () => {
      mockClient.getRoom.mockReturnValue(null);

      await expect(getMessages('!nonexistent:example.com')).rejects.toThrow('Room not found');
    });
  });
});
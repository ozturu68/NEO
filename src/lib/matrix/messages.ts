import { getMatrixClient } from './client';
import { EventType, RelationType } from 'matrix-js-sdk';
import type { MessageEvent } from '../../types/matrix';

export interface SendMessageOptions {
  roomId: string;
  text: string;
  html?: string;
  msgtype?: 'm.text' | 'm.emote' | 'm.notice';
}

/**
 * Send a text message to a room
 */
export async function sendMessage(options: SendMessageOptions): Promise<string> {
  try {
    // Input validation
    if (!options.roomId || options.roomId.trim() === '') {
      throw new Error('Room ID is required');
    }
    if (!options.text || options.text.trim() === '') {
      throw new Error('Message text is required');
    }
    
    const client = getMatrixClient();
    
    const content: any = {
      msgtype: options.msgtype || 'm.text',
      body: options.text,
    };
    
    if (options.html) {
      content.format = 'org.matrix.custom.html';
      content.formatted_body = options.html;
    }
    
    const { event_id } = await client.sendEvent(
      options.roomId,
      EventType.RoomMessage,
      content
    );
    
    return event_id;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Mesaj gönderilemedi: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Edit an existing message
 */
export async function editMessage(
  roomId: string,
  eventId: string,
  newText: string,
  newHtml?: string
): Promise<string> {
  try {
    // Input validation
    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID is required');
    }
    if (!eventId || eventId.trim() === '') {
      throw new Error('Event ID is required');
    }
    if (!newText || newText.trim() === '') {
      throw new Error('New text is required');
    }
    
    const client = getMatrixClient();
    
    const content: any = {
      msgtype: 'm.text',
      body: newText,
      'm.new_content': {
        msgtype: 'm.text',
        body: newText,
      },
      'm.relates_to': {
        rel_type: RelationType.Replace,
        event_id: eventId,
      },
    };
    
    if (newHtml) {
      content.format = 'org.matrix.custom.html';
      content.formatted_body = newHtml;
      content['m.new_content'].format = 'org.matrix.custom.html';
      content['m.new_content'].formatted_body = newHtml;
    }
    
    const { event_id } = await client.sendEvent(
      roomId,
      EventType.RoomMessage,
      content
    );
    
    return event_id;
  } catch (error) {
    console.error('Failed to edit message:', error);
    throw new Error('Mesaj düzenlenemedi: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Redact (delete) a message
 */
export async function redactMessage(roomId: string, eventId: string, reason?: string): Promise<void> {
  try {
    // Input validation
    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID is required');
    }
    if (!eventId || eventId.trim() === '') {
      throw new Error('Event ID is required');
    }
    
    const client = getMatrixClient();
    await client.redactEvent(roomId, eventId, reason);
  } catch (error) {
    console.error('Failed to redact message:', error);
    throw new Error('Mesaj silinemedi: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * React to a message with an emoji
 */
export async function reactToMessage(roomId: string, eventId: string, emoji: string): Promise<string> {
  try {
    // Input validation
    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID is required');
    }
    if (!eventId || eventId.trim() === '') {
      throw new Error('Event ID is required');
    }
    if (!emoji || emoji.trim() === '') {
      throw new Error('Emoji is required');
    }
    
    const client = getMatrixClient();
    
    const { event_id } = await client.sendEvent(roomId, EventType.Reaction, {
      'm.relates_to': {
        rel_type: RelationType.Annotation,
        event_id: eventId,
        key: emoji,
      },
    });
    
    return event_id;
  } catch (error) {
    console.error('Failed to react to message:', error);
    throw new Error('Mesaja tepki verilemedi: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Get messages from a room timeline
 */
export async function getMessages(roomId: string, limit = 20): Promise<MessageEvent[]> {
  try {
    // Input validation
    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID is required');
    }
    
    const client = getMatrixClient();
    const room = client.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();
    const limitedEvents = events.slice(-limit);
    
    // Convert to MessageEvent type
    return limitedEvents.map(event => ({
      event_id: event.getId()!,
      room_id: event.getRoomId()!,
      sender: event.getSender()!,
      origin_server_ts: event.getTs(),
      type: event.getType(),
      content: event.getContent(),
    })) as MessageEvent[];
  } catch (error) {
    console.error('Failed to get messages:', error);
    throw new Error('Mesajlar alınamadı: ' + (error instanceof Error ? error.message : String(error)));
  }
}
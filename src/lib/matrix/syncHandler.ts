import { MatrixClient, RoomEvent, Room } from 'matrix-js-sdk';
import { MatrixEvent } from 'matrix-js-sdk/lib/models/event';
import { useRoomsStore } from '../store/rooms.store';
import { useMessagesStore } from '../store/messages.store';

/**
 * Setup sync handlers to update Zustand stores from Matrix events
 */
export function setupSyncHandlers(client: MatrixClient): () => void {
  const unsubscribeCallbacks: (() => void)[] = [];
  
  // Helper to get store instances (outside React)
  const getRoomsStore = () => useRoomsStore.getState();
  const getMessagesStore = () => useMessagesStore.getState();
  
  // Room list updates
  const handleRoomList = () => {
    const rooms = client.getRooms();
    const roomData = rooms.map(room => ({
      id: room.roomId,
      name: room.name || room.roomId,
      avatar: room.getAvatarUrl(client.baseUrl, 64, 64, 'scale') || undefined,
      lastMessage: getLastMessagePreview(room),
      lastTimestamp: getLastTimestamp(room),
      unreadCount: room.getUnreadNotificationCount(),
      isEncrypted: room.hasEncryptionStateEvent(),
    }));
    
    getRoomsStore().setRooms(roomData);
  };
  
  // Initial room list
  handleRoomList();
  
  // Listen to room events for room list updates
  const onRoomUpdate = (_event: MatrixEvent, _room?: Room, _toStartOfTimeline?: boolean) => {
    handleRoomList();
  };
  
  // Use any type for event handlers to avoid complex signatures
  client.on(RoomEvent.Timeline, onRoomUpdate);
  unsubscribeCallbacks.push(() => client.removeListener(RoomEvent.Timeline, onRoomUpdate));
  
  client.on(RoomEvent.Name, onRoomUpdate as any);
  unsubscribeCallbacks.push(() => client.removeListener(RoomEvent.Name, onRoomUpdate as any));
  
  const onMembership = (room: Room, membership: string) => {
    if (membership === 'join') {
      handleRoomList();
    } else if (membership === 'leave' || membership === 'ban') {
      // Remove room from store
      getRoomsStore().removeRoom(room.roomId);
      getMessagesStore().clearRoomMessages(room.roomId);
    }
  };
  client.on(RoomEvent.MyMembership, onMembership);
  unsubscribeCallbacks.push(() => client.removeListener(RoomEvent.MyMembership, onMembership));
  
  // Messages
  const onTimeline = (event: MatrixEvent, room: Room | undefined, toStartOfTimeline?: boolean) => {
    if (toStartOfTimeline || !room) return; // Only process new events
    if (event.getType() === 'm.room.message') {
      const message = {
        id: event.getId()!,
        roomId: room.roomId,
        senderId: event.getSender()!,
        content: event.getContent(),
        timestamp: event.getTs(),
        isEncrypted: event.isEncrypted(),
        status: 'sent' as const,
      };
      getMessagesStore().addMessage(room.roomId, message);
      
      // Update room's last message
      getRoomsStore().updateRoom(room.roomId, {
        lastMessage: getMessagePreview(event.getContent()),
        lastTimestamp: event.getTs(),
      });
    }
  };
  client.on(RoomEvent.Timeline, onTimeline);
  unsubscribeCallbacks.push(() => client.removeListener(RoomEvent.Timeline, onTimeline));
  
  // Return cleanup function
  return () => unsubscribeCallbacks.forEach(fn => fn());
}

function getLastMessagePreview(room: Room): string {
  const timeline = room.getLiveTimeline();
  const events = timeline.getEvents();
  const lastEvent = events[events.length - 1];
  if (!lastEvent || lastEvent.getType() !== 'm.room.message') return '';
  return getMessagePreview(lastEvent.getContent());
}

function getLastTimestamp(room: Room): number {
  const timeline = room.getLiveTimeline();
  const events = timeline.getEvents();
  const lastEvent = events[events.length - 1];
  return lastEvent?.getTs() || Date.now();
}

function getMessagePreview(content: any): string {
  const msgtype = content.msgtype;
  if (msgtype === 'm.text' || msgtype === 'm.notice') {
    return content.body || '';
  } else if (msgtype === 'm.image') {
    return '[Image]';
  } else if (msgtype === 'm.video') {
    return '[Video]';
  } else if (msgtype === 'm.audio') {
    return '[Audio]';
  } else if (msgtype === 'm.file') {
    return '[File]';
  }
  return '[Message]';
}
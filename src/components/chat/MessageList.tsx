import React from 'react';
import { useMessagesStore } from '../../lib/store/messages.store';
import { useRoomsStore } from '../../lib/store/rooms.store';
import { useAuthStore } from '../../lib/store/auth.store';
import { MessageBubble } from './MessageBubble';

export const MessageList: React.FC = () => {
  const { activeRoomId } = useRoomsStore();
  const { messages } = useMessagesStore();
  const { userId } = useAuthStore();
  
  if (!activeRoomId) {
    return (
      <div className="h-full flex items-center justify-center text-pardus-text/70">
        Select a room to start chatting
      </div>
    );
  }
  
  const roomMessages = messages[activeRoomId] || [];
  
  if (roomMessages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-pardus-text/70">
        No messages yet. Start the conversation!
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto p-4">
      {roomMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === userId}
        />
      ))}
    </div>
  );
};
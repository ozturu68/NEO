import { useState } from 'react';
import { Send, Smile, Paperclip, Lock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoomsStore } from '../../lib/store/rooms.store';
import { useAuthStore } from '../../lib/store/auth.store';
import { sendMessage } from '../../lib/matrix/messages';
import { MessageList } from '../chat/MessageList';

export function MainPanel() {
  const { t } = useTranslation();
  const [inputMessage, setInputMessage] = useState('');
  const { activeRoomId, rooms } = useRoomsStore();
  const { userId } = useAuthStore();
  
  const activeRoom = activeRoomId ? rooms.find(r => r.id === activeRoomId) : null;
  
  const handleSend = async () => {
    if (!inputMessage.trim() || !activeRoomId || !userId) return;
    
    try {
      await sendMessage({
        roomId: activeRoomId,
        text: inputMessage.trim(),
        msgtype: 'm.text',
      });
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error to user
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  if (!activeRoomId) {
    return (
      <div className="h-full flex items-center justify-center text-pardus-text/70">
        Select a room from the sidebar to start chatting
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-pardus-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-pardus-primary flex items-center justify-center text-white font-bold">
              {activeRoom?.name?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold">{activeRoom?.name || 'Unknown Room'}</h2>
                {activeRoom?.isEncrypted && (
                  <Lock size={14} className="text-green-600" />
                )}
              </div>
              <p className="text-sm text-pardus-text/70 flex items-center gap-1">
                <Users size={12} />
                <span>{activeRoom ? 'Members' : 'Loading...'}</span>
              </p>
            </div>
          </div>
          <div className="text-sm text-pardus-text/70">
            {activeRoom?.lastTimestamp ? new Date(activeRoom.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-pardus-border">
        <div className="flex items-center">
          <button className="p-2 text-pardus-text/70 hover:text-pardus-primary">
            <Paperclip size={20} />
          </button>
          <button className="p-2 text-pardus-text/70 hover:text-pardus-primary ml-1">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder', 'Type a message...')}
            className="flex-1 mx-3 px-4 py-2 border border-pardus-border rounded-full focus:outline-none focus:ring-2 focus:ring-pardus-primary"
            disabled={!activeRoomId}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || !activeRoomId}
            className="btn-pardus rounded-full p-3 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
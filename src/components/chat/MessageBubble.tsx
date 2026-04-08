import React from 'react';
import type { Message } from '../../lib/store/messages.store';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const { content, timestamp, senderId, isEncrypted } = message;
  
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderContent = () => {
    const msgtype = content.msgtype;
    if (msgtype === 'm.text' || msgtype === 'm.notice') {
      return <p className="text-pardus-text">{content.body}</p>;
    } else if (msgtype === 'm.image') {
      return (
        <div>
          <p className="text-pardus-text/70">[Image]</p>
          {content.body && <p className="text-sm text-pardus-text/70">{content.body}</p>}
        </div>
      );
    } else if (msgtype === 'm.video') {
      return <p className="text-pardus-text/70">[Video]</p>;
    } else if (msgtype === 'm.audio') {
      return <p className="text-pardus-text/70">[Audio]</p>;
    } else if (msgtype === 'm.file') {
      return <p className="text-pardus-text/70">[File] {content.body}</p>;
    } else {
      return <p className="text-pardus-text/70">[Unknown message type]</p>;
    }
  };
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-pardus-primary text-white rounded-br-none' : 'bg-pardus-surface border border-pardus-border rounded-bl-none'}`}>
        {!isOwn && (
          <div className="text-xs font-medium text-pardus-text/70 mb-1">
            {senderId}
          </div>
        )}
        {renderContent()}
        <div className={`flex items-center justify-between mt-1 ${isOwn ? 'text-white/80' : 'text-pardus-text/70'}`}>
          <span className="text-xs">{formatTime(timestamp)}</span>
          {isEncrypted && (
            <span className="text-xs ml-2">🔒</span>
          )}
        </div>
      </div>
    </div>
  );
};
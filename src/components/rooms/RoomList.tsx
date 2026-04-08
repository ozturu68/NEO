import React from 'react';
import { useRoomsStore } from '../../lib/store/rooms.store';

const RoomList: React.FC = () => {
  const { rooms, activeRoomId, setActiveRoom } = useRoomsStore();

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No rooms yet. Join or create a room to start chatting.
      </div>
    );
  }

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`room-item p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
            activeRoomId === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
          }`}
          onClick={() => setActiveRoom(room.id)}
        >
          <div className="flex items-center">
            {room.avatar ? (
              <img
                src={room.avatar}
                alt={room.name}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                <span className="text-gray-600 font-medium">
                  {room.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{room.name}</h3>
                {room.lastTimestamp && (
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(room.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {room.lastMessage || 'No messages yet'}
              </p>
              <div className="flex justify-between items-center mt-1">
                {room.isEncrypted && (
                  <span className="text-xs text-green-600">🔒 Encrypted</span>
                )}
                {room.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {room.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
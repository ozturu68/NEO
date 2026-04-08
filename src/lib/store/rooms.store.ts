import { create } from 'zustand';

interface Room {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastTimestamp: number;
  unreadCount: number;
  isEncrypted: boolean;
}

interface RoomsState {
  rooms: Room[];
  activeRoomId: string | null;
  isLoading: boolean;
  
  // Actions
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  clearRooms: () => void;
}

export const useRoomsStore = create<RoomsState>((set) => ({
  rooms: [],
  activeRoomId: null,
  isLoading: false,

  setRooms: (rooms) => set({ rooms }),
  
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  
  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map(room =>
      room.id === roomId ? { ...room, ...updates } : room
    ),
  })),
  
  removeRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter(room => room.id !== roomId),
    activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
  })),
  
  clearRooms: () => set({ rooms: [], activeRoomId: null }),
}));
import { create } from 'zustand';

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: any; // Matrix message content object
  timestamp: number;
  isEncrypted: boolean;
  status: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, string[]>;
}

interface MessagesState {
  messages: Record<string, Message[]>; // roomId -> messages[]
  loadingRooms: Set<string>;
  
  // Actions
  addMessage: (roomId: string, message: Message) => void;
  addMessages: (roomId: string, messages: Message[]) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  clearRoomMessages: (roomId: string) => void;
  setLoading: (roomId: string, loading: boolean) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messages: {},
  loadingRooms: new Set(),

  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message],
    },
  })),

  addMessages: (roomId, newMessages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), ...newMessages],
    },
  })),

  updateMessage: (roomId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: (state.messages[roomId] || []).map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    },
  })),

  deleteMessage: (roomId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: (state.messages[roomId] || []).filter(msg => msg.id !== messageId),
    },
  })),

  clearRoomMessages: (roomId) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [],
    },
  })),

  setLoading: (roomId, loading) => set((state) => {
    const newLoadingRooms = new Set(state.loadingRooms);
    if (loading) {
      newLoadingRooms.add(roomId);
    } else {
      newLoadingRooms.delete(roomId);
    }
    return { loadingRooms: newLoadingRooms };
  }),
}));
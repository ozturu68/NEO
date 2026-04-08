import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoomList from './RoomList';
import { useRoomsStore } from '../../lib/store/rooms.store';

// Mock the store
vi.mock('../../lib/store/rooms.store', () => ({
  useRoomsStore: vi.fn(),
}));

describe('RoomList', () => {
  const mockSetActiveRoom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoomsStore as any).mockReturnValue({
      rooms: [],
      activeRoomId: null,
      setActiveRoom: mockSetActiveRoom,
    });
  });

  it('should show message when no rooms', () => {
    render(<RoomList />);
    
    expect(screen.getByText(/No rooms yet/i)).toBeInTheDocument();
  });

  it('should display list of rooms', () => {
    const mockRooms = [
      {
        id: '!room1:example.com',
        name: 'General Chat',
        avatar: undefined,
        lastMessage: 'Hello everyone!',
        lastTimestamp: Date.now() - 3600000,
        unreadCount: 3,
        isEncrypted: true,
      },
      {
        id: '!room2:example.com',
        name: 'Project Discussion',
        avatar: undefined,
        lastMessage: 'Meeting at 3 PM',
        lastTimestamp: Date.now() - 1800000,
        unreadCount: 0,
        isEncrypted: false,
      },
    ];

    (useRoomsStore as any).mockReturnValue({
      rooms: mockRooms,
      activeRoomId: null,
      setActiveRoom: mockSetActiveRoom,
    });

    render(<RoomList />);

    expect(screen.getByText('General Chat')).toBeInTheDocument();
    expect(screen.getByText('Project Discussion')).toBeInTheDocument();
    expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
    expect(screen.getByText('Meeting at 3 PM')).toBeInTheDocument();
    expect(screen.getByText('🔒 Encrypted')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Unread count badge
  });

  it('should highlight active room', () => {
    const mockRooms = [
      {
        id: '!room1:example.com',
        name: 'General Chat',
        avatar: undefined,
        lastMessage: 'Hello',
        lastTimestamp: Date.now(),
        unreadCount: 0,
        isEncrypted: false,
      },
    ];

    (useRoomsStore as any).mockReturnValue({
      rooms: mockRooms,
      activeRoomId: '!room1:example.com',
      setActiveRoom: mockSetActiveRoom,
    });

    render(<RoomList />);

    const roomItem = screen.getByText('General Chat').closest('.room-item');
    expect(roomItem).toHaveClass('bg-blue-50');
    expect(roomItem).toHaveClass('border-l-4');
  });

  it('should call setActiveRoom when room is clicked', () => {
    const mockRooms = [
      {
        id: '!room1:example.com',
        name: 'General Chat',
        avatar: undefined,
        lastMessage: 'Hello',
        lastTimestamp: Date.now(),
        unreadCount: 0,
        isEncrypted: false,
      },
    ];

    (useRoomsStore as any).mockReturnValue({
      rooms: mockRooms,
      activeRoomId: null,
      setActiveRoom: mockSetActiveRoom,
    });

    render(<RoomList />);
    
    screen.getByText('General Chat').click();
    
    expect(mockSetActiveRoom).toHaveBeenCalledWith('!room1:example.com');
  });
});
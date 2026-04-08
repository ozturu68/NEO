import { Home, MessageSquare, Users, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../../lib/store/auth.store';
import RoomList from '../rooms/RoomList';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { logout } = useAuthStore();
  
  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', active: true },
    { icon: MessageSquare, label: 'Sohbetler', badge: 3 },
    { icon: Users, label: 'Topluluklar' },
    { icon: Settings, label: 'Ayarlar' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-pardus-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-pardus-primary">Neo</h1>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-pardus-border"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-pardus-primary text-white'
                    : 'text-pardus-text hover:bg-pardus-border'
                }`}
              >
                <item.icon size={20} />
                {!collapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
                {item.badge && !collapsed && (
                  <span className="ml-auto bg-pardus-secondary text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Logout button */}
        <div className="mt-4 pt-4 border-t border-pardus-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-pardus-text hover:bg-pardus-border transition-colors"
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">Çıkış Yap</span>}
          </button>
        </div>
      </nav>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto border-t border-pardus-border">
        <RoomList />
      </div>

      {/* User profile */}
      <div className="p-4 border-t border-pardus-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-pardus-primary flex items-center justify-center text-white font-bold">
            U
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1">
              <p className="font-medium text-sm">Kullanıcı</p>
              <p className="text-xs text-pardus-text/70">Çevrimiçi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
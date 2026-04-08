import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/auth.store';
import { Sidebar } from './Sidebar';
import { MainPanel } from './MainPanel';
import { RightPanel } from './RightPanel';

export function MainLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, restore } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const restored = await restore();
        if (!restored) {
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, restore, navigate]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-pardus-bg">
      <div className="text-pardus-primary">Yükleniyor...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="h-screen flex bg-pardus-surface">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 border-r border-pardus-border`}>
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <MainPanel />
      </div>

      {/* Right Panel (Member list, details) */}
      <div className="w-80 border-l border-pardus-border hidden lg:block">
        <RightPanel />
      </div>
    </div>
  );
}
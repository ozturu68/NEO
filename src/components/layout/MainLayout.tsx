import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainPanel } from './MainPanel';
import { RightPanel } from './RightPanel';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
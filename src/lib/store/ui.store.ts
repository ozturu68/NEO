import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'tr' | 'en';
  showSettings: boolean;
  activeModal: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  setLanguage: (language: UIState['language']) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  language: 'tr',
  showSettings: false,
  activeModal: null,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setTheme: (theme) => set({ theme }),
  
  setLanguage: (language) => set({ language }),
  
  openSettings: () => set({ showSettings: true }),
  
  closeSettings: () => set({ showSettings: false }),
  
  openModal: (modalId) => set({ activeModal: modalId }),
  
  closeModal: () => set({ activeModal: null }),
}));
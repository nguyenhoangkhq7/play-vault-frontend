import { create } from 'zustand';

export const useLibraryStore = create((set) => ({
  refreshTrigger: 0,
  refreshLibrary: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
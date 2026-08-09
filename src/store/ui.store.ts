import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  toggleTheme: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  newTicketIds: Set<string>;
  markTicketNew: (ticketId: string) => void;
  clearTicketNew: (ticketId: string) => void;
}

function applyThemeToDocument(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

const initialTheme: Theme =
  (localStorage.getItem('theme') as Theme | null) ??
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyThemeToDocument(initialTheme);

export const useUiStore = create<UiState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyThemeToDocument(next);
    set({ theme: next });
  },
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  newTicketIds: new Set<string>(),
  markTicketNew: (ticketId) =>
    set((state) => ({ newTicketIds: new Set(state.newTicketIds).add(ticketId) })),
  clearTicketNew: (ticketId) =>
    set((state) => {
      if (!state.newTicketIds.has(ticketId)) return state;
      const next = new Set(state.newTicketIds);
      next.delete(ticketId);
      return { newTicketIds: next };
    }),
}));

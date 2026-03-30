import { create } from 'zustand';

interface Template {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface Contact {
  id: string;
  phone_number: string;
  name: string;
  tags: string[];
}

interface BroadcastProgress {
  sent: number;
  total: number;
  failed: number;
}

interface AppState {
  // State
  selectedTemplate: Template | null;
  selectedContacts: Contact[];
  broadcastProgress: BroadcastProgress | null;

  // Actions
  setSelectedTemplate: (template: Template | null) => void;
  toggleContactSelection: (contact: Contact) => void;
  selectAllContacts: (contacts: Contact[]) => void;
  clearContactSelection: () => void;
  updateBroadcastProgress: (progress: BroadcastProgress) => void;
  resetBroadcast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedTemplate: null,
  selectedContacts: [],
  broadcastProgress: null,

  // Actions
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  toggleContactSelection: (contact) => {
    const { selectedContacts } = get();
    const exists = selectedContacts.find((c) => c.id === contact.id);

    if (exists) {
      set({
        selectedContacts: selectedContacts.filter((c) => c.id !== contact.id),
      });
    } else {
      set({
        selectedContacts: [...selectedContacts, contact],
      });
    }
  },

  selectAllContacts: (contacts) => set({ selectedContacts: contacts }),

  clearContactSelection: () => set({ selectedContacts: [] }),

  updateBroadcastProgress: (progress) => set({ broadcastProgress: progress }),

  resetBroadcast: () =>
    set({
      selectedTemplate: null,
      selectedContacts: [],
      broadcastProgress: null,
    }),
}));

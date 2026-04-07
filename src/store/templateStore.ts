import { create } from 'zustand';
import { templateService } from '@/services/templates';
import type { Template } from '@/types';
import { logger } from '@/utils/logger';

interface TemplateStore {
  templates: Template[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  hasInitiallyFetched: boolean;

  // Actions
  fetchTemplates: (isSilent?: boolean) => Promise<void>;
  syncTemplates: () => Promise<void>;
  setTemplates: (templates: Template[]) => void;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  hasInitiallyFetched: false,

  setTemplates: (templates) => set({ templates }),

  fetchTemplates: async (isSilent = false) => {
    try {
      if (!isSilent) set({ isLoading: true });
      set({ error: null });

      const data = await templateService.getAll();
      set({ 
        templates: data, 
        hasInitiallyFetched: true,
        isLoading: false 
      });
      
      logger.info('TEMPLATE_STORE', 'Fetched templates successfully', { count: data.length, isSilent });
    } catch (err: any) {
      logger.error('TEMPLATE_STORE', 'Failed to fetch templates', { error: err.message });
      set({ error: 'Failed to load template library', isLoading: false });
    }
  },

  syncTemplates: async () => {
    try {
      set({ isSyncing: true, error: null });
      logger.info('TEMPLATE_STORE', 'Triggering manual sync with Meta');
      
      const { templates: syncedData } = await templateService.sync();
      
      set({ 
        templates: syncedData, 
        isSyncing: false,
        hasInitiallyFetched: true 
      });
      
      logger.info('TEMPLATE_STORE', 'Sync successful', { count: syncedData.length });
    } catch (err: any) {
      logger.error('TEMPLATE_STORE', 'Sync failed', { error: err.message });
      set({ 
        error: 'Failed to sync templates from Meta. Please try again.', 
        isSyncing: false 
      });
      throw err;
    }
  },

  deleteTemplate: async (id: string) => {
    try {
      await templateService.delete(id);
      const { templates } = get();
      set({ templates: templates.filter(t => t.id !== id) });
      logger.info('TEMPLATE_STORE', 'Template deleted', { id });
    } catch (err: any) {
      logger.error('TEMPLATE_STORE', 'Failed to delete template', { id, error: err.message });
      throw err;
    }
  }
}));

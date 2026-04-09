import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MessageSquare, Megaphone, Wrench, Bell, Loader2, RefreshCw } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useTemplateStore } from '@/store/templateStore';
import type { Template, TemplateCategory, TemplateStatus } from '@/types';
import { logger } from '@/utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /templates  (page3.png)
// Templates Management — list view with stats row, table, inline preview panel
// UI-only: no data fetching. Boilerplate states only.
// ─────────────────────────────────────────────────────────────────────────────

type TabKey = 'all' | 'archived' | 'drafts';

interface TemplateRow {
  id: string;
  name: string;
  updatedLabel: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  icon: React.ReactNode;
}

// ─── Category icon map ────────────────────────────────────────────────────────
const categoryIcon = (category: TemplateCategory) => {
  if (category === 'MARKETING') return <Megaphone size={16} className="text-[#1B1B1B]/40" />;
  if (category === 'UTILITY') return <Wrench size={16} className="text-[#1B1B1B]/40" />;
  if (category === 'TRANSACTIONAL') return <MessageSquare size={16} className="text-[#1B1B1B]/40" />;
  return <Bell size={16} className="text-[#1B1B1B]/40" />;
};

const categoryBadgeStyle = (category: TemplateCategory) => {
  const base = 'px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase';
  if (category === 'MARKETING') return `${base} bg-[#E8E8E8] text-[#1B1B1B]`;
  if (category === 'UTILITY') return `${base} bg-transparent text-[#1B1B1B] border border-[#CCCCCC]`;
  if (category === 'TRANSACTIONAL') return `${base} bg-transparent text-[#1B1B1B] border border-[#CCCCCC]`;
  return `${base} bg-[#E8E8E8] text-[#1B1B1B]`;
};

// ─── Empty row placeholder ────────────────────────────────────────────────────

export default function Templates() {
  const navigate = useNavigate();
  const { 
    templates: storeTemplates, 
    isLoading, 
    isSyncing, 
    error, 
    hasInitiallyFetched,
    fetchTemplates,
    syncTemplates,
    deleteTemplate
  } = useTemplateStore();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const hasAttemptedAutoSync = useRef(false);

  // Map backend Template to UI TemplateRow
  const templates = useMemo(() => {
    return storeTemplates.map((t: Template) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      updatedLabel: t.last_synced_at ? `Synced ${new Date(t.last_synced_at).toLocaleDateString()}` : 'Not synced',
      icon: null,
    })) as TemplateRow[];
  }, [storeTemplates]);

  // Stats calculation
  const totalTemplates = templates.length;
  const approvedCount = templates.filter(t => t.status === 'APPROVED').length;
  const pendingCount = templates.filter(t => t.status === 'PENDING').length;

  useEffect(() => {
    const initialize = async () => {
      // If we haven't fetched yet, do a full load
      if (!hasInitiallyFetched) {
        await fetchTemplates(false);
      } else {
        // If we have data, refresh quietly in background
        fetchTemplates(true);
      }
    };

    initialize();
  }, []);

  // Auto-sync logic: If library is empty after fetch, trigger sync once
  useEffect(() => {
    if (hasInitiallyFetched && storeTemplates.length === 0 && !hasAttemptedAutoSync.current && !isSyncing) {
      hasAttemptedAutoSync.current = true;
      syncTemplates().catch(() => {
        logger.error('TEMPLATES_PAGE', 'Auto-sync failed');
      });
    }
  }, [hasInitiallyFetched, storeTemplates.length, isSyncing]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;

    try {
      await deleteTemplate(id);
      logger.info('TEMPLATES_PAGE', 'Template deleted successfully', { id });
    } catch (err: any) {
      alert('Failed to delete template. Please try again.');
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all',      label: 'ALL LIBRARY' },
    { key: 'archived', label: 'ARCHIVED' },
    { key: 'drafts',   label: 'DRAFTS' },
  ];

  const handlePreview = (id: string) => {
    setPreviewTemplateId(id);
    setPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
       <TopBar
        title="Templates Management"
        searchPlaceholder="Search templates..."
        onSync={syncTemplates}
        isSyncing={isSyncing}
        stats={tabs.map(tab => ({
          label: tab.label,
          isActive: activeTab === tab.key,
          onClick: () => setActiveTab(tab.key),
          color: activeTab === tab.key ? 'text-[#25D366]' : 'text-[#1B1B1B]/40'
        }))}
      />

      <div className="flex-1 overflow-auto p-8">
        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 mb-8 bg-white border border-[#E8E8E8]">
          {/* Total */}
          <div className="p-6 border-r border-[#E8E8E8] relative overflow-hidden group">
            {isLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F3F3F3] to-transparent skeleton-shimmer" />}
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase mb-3 relative z-10">
              TOTAL TEMPLATES
            </p>
            <p className="text-[2.5rem] font-black text-[#1B1B1B] leading-none relative z-10 transition-all duration-500">
              {isLoading ? '---' : totalTemplates.toString().padStart(3, '0')}
            </p>
          </div>

          {/* Approved */}
          <div className="p-6 border-r border-[#E8E8E8] relative overflow-hidden group">
            {isLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F3F3F3] to-transparent skeleton-shimmer" />}
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase mb-3 relative z-10">
              APPROVED
            </p>
            <p className="text-[2.5rem] font-black text-[#25D366] leading-none relative z-10">
              {isLoading ? '---' : approvedCount.toString().padStart(3, '0')}
            </p>
          </div>

          {/* Pending */}
          <div className="p-6 border-r border-[#E8E8E8] relative overflow-hidden group">
            {isLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F3F3F3] to-transparent skeleton-shimmer" />}
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase mb-3 relative z-10">
              PENDING
            </p>
            <p className="text-[2.5rem] font-black text-[#1B1B1B]/20 leading-none relative z-10">
              {isLoading ? '---' : pendingCount.toString().padStart(2, '0')}
            </p>
          </div>

          {/* Action — New Template */}
          <div
            id="templates-new-btn"
            className="p-6 bg-[#1B1B1B] flex flex-col justify-between cursor-pointer hover:bg-[#111111] transition-all duration-300 group overflow-hidden"
            onClick={() => navigate('/templates/create')}
          >
            {isSyncing && <div className="absolute top-0 left-0 h-1 bg-[#25D366] progress-loading" />}
            <p className="text-[11px] font-semibold tracking-widest text-white/40 uppercase relative z-10">
              {isSyncing ? 'SYNCING_META...' : 'ACTION'}
            </p>
            <div className="flex items-end justify-between relative z-10">
              <p className="text-xl font-black text-white leading-tight">
                {isSyncing ? 'Please\nWait' : <>New<br />Template</>}
              </p>
              <div className="w-8 h-8 border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isSyncing ? <Loader2 size={16} className="text-white animate-spin" /> : <Plus size={16} className="text-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sync Status Bar (Premium Detail) ─────────────────────────────────── */}
        {isSyncing && !isLoading && (
          <div className="mb-4 bg-[#25D366]/5 border border-[#25D366]/20 py-3 px-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <RefreshCw size={14} className="text-[#25D366] animate-spin" />
            <p className="text-xs font-semibold text-[#1B1B1B] tracking-wider uppercase">
              Connecting to Meta Cloud API — Fetching latest template versions...
            </p>
          </div>
        )}

        {/* ── Templates table ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E8E8E8] relative min-h-[300px]">
          {isLoading ? (
            <div className="divide-y divide-[#E8E8E8]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-3 border-b border-[#E8E8E8] bg-[#F9F9F9]">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-2 w-16 bg-[#1B1B1B]/5 rounded animate-pulse" />)}
              </div>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-5 items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F3F3F3] to-transparent skeleton-shimmer" />
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black/5 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-black/5" />
                      <div className="h-2 w-16 bg-black/5" />
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-black/5" />
                  <div className="h-4 w-12 bg-black/5" />
                  <div className="h-4 w-16 bg-black/5" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-black/5 rounded" />
                    <div className="w-8 h-8 bg-black/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Bell size={24} className="text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#1B1B1B] tracking-wider uppercase mb-1">
                  CONNECTION_FAILURE
                </p>
                <p className="text-xs text-[#1B1B1B]/40 max-w-[250px] leading-relaxed">
                  {error}
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 h-11 px-8 bg-[#1B1B1B] text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-red-600 transition-colors"
              >
                RETRY_CONNECTION
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-3 border-b border-[#E8E8E8]">
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase">
              TEMPLATE NAME
            </p>
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase">
              CATEGORY
            </p>
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase">
              LANGUAGE
            </p>
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase">
              STATUS
            </p>
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase pr-2">
              ACTIONS
            </p>
          </div>

          {/* Empty state */}
          {templates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white">
              <div className="w-16 h-16 rounded-full bg-[#F3F3F3] flex items-center justify-center mb-2">
                <MessageSquare size={32} className={isSyncing ? "text-[#25D366] animate-pulse" : "text-[#1B1B1B]/20"} />
              </div>
              <div className="text-center px-6">
                <p className="text-sm font-bold text-[#1B1B1B] tracking-wider uppercase mb-1">
                  {isSyncing ? 'FETCHING_FROM_META' : 'NO TEMPLATES FOUND'}
                </p>
                <p className="text-xs text-[#1B1B1B]/40 max-w-[300px] leading-relaxed mx-auto">
                  {isSyncing 
                    ? "We're currently importing your template library from WhatsApp. This usually takes a few seconds."
                    : "You haven't created any templates on WhatsApp yet. Sync now or create one on Meta Business Suite."}
                </p>
              </div>
              
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => syncTemplates()}
                  disabled={isSyncing}
                  className={`h-11 px-8 border-2 border-[#1B1B1B] text-[#1B1B1B] text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1B1B1B] hover:text-white transition-all flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  SYNC_FROM_META
                </button>
                
                <button
                  onClick={() => navigate('/templates/create')}
                  className="h-11 px-8 bg-[#25D366] text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1DA851] shadow-lg shadow-[#25D366]/20 transition-all"
                >
                  CREATE NEW
                </button>
              </div>
            </div>
          )}

          {/* Template rows */}
          {templates.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-4 border-b border-[#E8E8E8] items-center hover:bg-[#F9F9F9] transition-colors group"
            >
              {/* Name + icon */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F3F3F3] flex items-center justify-center shrink-0">
                  {categoryIcon(row.category)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B1B1B]">{row.name}</p>
                  <p className="text-xs text-[#1B1B1B]/40">{row.updatedLabel}</p>
                </div>
              </div>

              {/* Category badge */}
              <div>
                <span className={categoryBadgeStyle(row.category)}>{row.category}</span>
              </div>

              {/* Language */}
              <p className="text-sm text-[#1B1B1B]/60 font-medium">{row.language}</p>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 shrink-0 ${
                    row.status === 'APPROVED'
                      ? 'bg-[#25D366]'
                      : row.status === 'PENDING'
                      ? 'bg-amber-400'
                      : 'bg-red-500'
                  }`}
                />
                <p className="text-sm font-semibold text-[#1B1B1B]">{row.status}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={() => handlePreview(row.id)}
                  className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/30 hover:text-[#1B1B1B] transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/30 hover:text-red-500 transition-colors"
                  onClick={() => handleDelete(row.id, row.name)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Footer count */}
          {templates.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/30 uppercase">
                SHOWING {templates.length} OF {totalTemplates} TEMPLATES
              </p>
            </div>
          )}

          {/* ── Inline preview panel (right side overlay) ──────────────────── */}
          {previewOpen && (
            <div
              id="templates-preview-panel"
              className="absolute right-0 top-0 w-72 bg-white border-l border-[#E8E8E8] shadow-xl h-full flex flex-col"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E8E8E8]">
                <span className="w-2 h-2 bg-[#25D366]" />
                <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B] uppercase">
                  INSTANT PREVIEW
                </p>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="ml-auto text-[#1B1B1B]/30 hover:text-[#1B1B1B] text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* Preview bubble */}
              <div className="flex-1 p-5">
                <div className="bg-[#F3F3F3] p-4 text-sm text-[#1B1B1B] leading-relaxed">
                  <p>
                    Hi <span className="font-semibold text-[#25D366]">{'{{1}}'}</span>, your order{' '}
                    <span className="font-semibold">{'#{{2}}'}</span> has been confirmed and will be
                    shipped by <span className="font-semibold">{'{{3}}'}</span>.
                  </p>
                </div>
              </div>

              {/* Copy code button */}
              <div className="p-5 border-t border-[#E8E8E8]">
                <button
                  id="templates-copy-code-btn"
                  onClick={() => {
                    if (previewTemplateId) {
                      navigator.clipboard.writeText(previewTemplateId);
                    }
                  }}
                  className="w-full h-12 bg-[#1B1B1B] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#333] transition-colors"
                >
                  COPY CODE
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

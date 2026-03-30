import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MessageSquare, Megaphone, Wrench, Bell } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /templates  (page3.png)
// Templates Management — list view with stats row, table, inline preview panel
// UI-only: no data fetching. Boilerplate states only.
// ─────────────────────────────────────────────────────────────────────────────

type TabKey = 'all' | 'archived' | 'drafts';

type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
type TemplateCategory = 'MARKETING' | 'UTILITY' | 'TRANSACTIONAL' | 'AUTHENTICATION';

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
const EMPTY_ROWS: TemplateRow[] = [];

export default function Templates() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Boilerplate state — data will come from API
  const templates: TemplateRow[] = EMPTY_ROWS;
  const totalTemplates = 0;
  const approvedCount = 0;
  const pendingCount = 0;

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
        breadcrumb={['Templates Management']}
        searchPlaceholder="Search templates..."
        rightSlot={
          <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                id={`templates-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`text-xs font-semibold tracking-wider pb-0.5 transition-all ${
                  activeTab === tab.key
                    ? 'text-[#25D366] border-b-2 border-[#25D366]'
                    : 'text-[#1B1B1B]/40 hover:text-[#1B1B1B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-8">
        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 mb-8 bg-white border border-[#E8E8E8]">
          {/* Total */}
          <div className="p-6 border-r border-[#E8E8E8]">
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase mb-3">
              TOTAL TEMPLATES
            </p>
            <p className="text-[2.5rem] font-black text-[#1B1B1B] leading-none">
              {totalTemplates.toString().padStart(3, '0')}
            </p>
          </div>

          {/* Approved */}
          <div className="p-6 border-r border-[#E8E8E8]">
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase mb-3">
              APPROVED
            </p>
            <p className="text-[2.5rem] font-black text-[#25D366] leading-none">
              {approvedCount.toString().padStart(3, '0')}
            </p>
          </div>

          {/* Pending */}
          <div className="p-6 border-r border-[#E8E8E8]">
            <p className="text-[11px] font-semibold tracking-widest text-[#1B1B1B]/40 uppercase mb-3">
              PENDING
            </p>
            <p className="text-[2.5rem] font-black text-[#1B1B1B]/20 leading-none">
              {pendingCount.toString().padStart(2, '0')}
            </p>
          </div>

          {/* Action — New Template */}
          <div
            id="templates-new-btn"
            className="p-6 bg-[#1B1B1B] flex flex-col justify-between cursor-pointer hover:bg-[#111111] transition-colors"
            onClick={() => navigate('/templates/create')}
          >
            <p className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
              ACTION
            </p>
            <div className="flex items-end justify-between">
              <p className="text-xl font-black text-white leading-tight">
                New<br />Template
              </p>
              <div className="w-8 h-8 border border-white/30 flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Templates table ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E8E8E8] relative">
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
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <MessageSquare size={32} className="text-[#1B1B1B]/20" />
              <p className="text-sm font-semibold text-[#1B1B1B]/40 tracking-wider">
                NO TEMPLATES YET
              </p>
              <p className="text-sm text-[#1B1B1B]/30">
                Create your first template to get started.
              </p>
              <button
                onClick={() => navigate('/templates/create')}
                className="mt-2 h-10 px-6 bg-[#1B1B1B] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#333] transition-colors"
              >
                CREATE TEMPLATE
              </button>
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
                <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/30 hover:text-red-500 transition-colors">
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
        </div>
      </div>
    </div>
  );
}

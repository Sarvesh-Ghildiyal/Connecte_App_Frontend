import { useRef, useState, useEffect, useMemo } from 'react';
import { Upload, UserPlus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TopBar } from '@/components/layout/TopBar';
import ImportSuccessModal from '@/components/contacts/ImportSuccessModal';
import AddContactModal from '@/components/contacts/AddContactModal';
import { contactService } from '@/services/contacts';
import type { Contact } from '@/types';
import { logger } from '@/utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /contacts  (page4.png)
//
// Structure:
//   DashboardLayout → TopBar → scrollable content body
//
// CSV Import Flow:
//   1. User clicks IMPORT CSV → hidden file input opens
//   2. FileReader reads the CSV → parse rows into { name, phone }
//   3. Deduplicate by phone
//   4. Show ImportSuccessModal with stats
// ─────────────────────────────────────────────────────────────────────────────

// ── Parsed Result Type ────────────────────────────────────────────────────────
interface ContactUI {
  id: string;
  name: string;
  initials: string;
  updatedAt: string;
  phone: string;
  createdAt: string;
  optInStatus: string;
  tags: { label: string; variant: 'outline' }[];
}

// ── CSV Parser ────────────────────────────────────────────────────────────────
interface ParsedResult {
  validRecords: number;
  duplicatesSkipped: number;
  refId: string;
}

function parseCsv(raw: string): ParsedResult {
  const lines = raw.trim().split(/\r?\n/);
  // Skip header row if it exists (detect if first cell looks like a label)
  const dataLines = lines[0]?.toLowerCase().includes('name') || lines[0]?.toLowerCase().includes('phone')
    ? lines.slice(1)
    : lines;

  const seen = new Set<string>();
  let valid = 0;
  let dupes = 0;

  dataLines.forEach(line => {
    if (!line.trim()) return;
    const cols = line.split(/[,;]/).map(c => c.trim().replace(/^"|"$/g, ''));
    const phone = cols[1] || cols[0]; // assume col[1] is phone or take col[0]
    if (!phone) return;
    if (seen.has(phone)) {
      dupes++;
    } else {
      seen.add(phone);
      valid++;
    }
  });

  return {
    validRecords: valid,
    duplicatesSkipped: dupes,
    refId: `REF_ID: PRO-${Math.random().toString(36).slice(2, 8).toUpperCase()}-001`,
  };
}

// ── Tag chip component ────────────────────────────────────────────────────────
function TagChip({ label }: { label: string }) {
  const base = 'inline-flex items-center px-3 py-1 text-[9px] font-black tracking-widest uppercase';
  
  // Decide style based on label content (matching page4.png)
  let style = 'bg-[#F3F3F3] text-[#1B1B1B]'; // Default gray
  if (['ENTERPRISE', 'PARTNER', 'URGENT'].includes(label.toUpperCase())) {
    style = 'bg-[#1B1B1B] text-white';
  } else if (['ACTIVE', 'NEW', 'LEADS'].includes(label.toUpperCase())) {
    style = 'bg-[#F3F3F3] text-[#1B1B1B]';
  } else if (['VIP', 'SUCCESS'].includes(label.toUpperCase())) {
    style = 'bg-[#25D366] text-white';
  }

  return <span className={`${base} ${style}`}>{label}</span>;
}

// ── Page component ────────────────────────────────────────────────────────────
export default function Contacts() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [importResult, setImportResult] = useState<ParsedResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ContactUI[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derived: Unique tags from real data for filtration
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach(c => c.tags.forEach(t => tags.add(t.label)));
    return Array.from(tags).sort();
  }, [contacts]);

  const fetchContacts = async () => {
    try {
      if (contacts.length === 0) setIsLoading(true);
      setError(null);
      const response = await contactService.getAll();
      logger.info('CONTACTS_PAGE', 'Fetched contacts successfully', { count: response.contacts.length });
      
      const mapped: ContactUI[] = response.contacts.map((c: Contact) => {
        const initials = c.name
          ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : '??';

        return {
          id: c.id,
          name: c.name || 'Unknown',
          initials: initials,
          updatedAt: c.created_at ? `Added ${new Date(c.created_at).toLocaleDateString()}` : 'Date unknown',
          phone: c.phone_number,
          createdAt: c.created_at,
          optInStatus: c.opted_in ? 'opted_in' : 'opted_out',
          tags: (c.tags || []).map(tag => ({
            label: tag.toUpperCase(),
            variant: 'outline' as const
          }))
        };
      });

      setContacts(mapped);
      setTotalCount(response.count || response.contacts.length);
    } catch (err: any) {
      logger.error('CONTACTS_PAGE', 'Failed to fetch contacts', { error: err.message });
      setError('Failed to load contact directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await fetchContacts();
      logger.info('CONTACTS_PAGE', 'Manual refresh successful');
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculate genuine metrics
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const newTodayCount = contacts.filter(c => {
      if (!c.createdAt) return false;
      return new Date(c.createdAt).toISOString().split('T')[0] === todayStr;
    }).length;

    const activeCount = contacts.filter(c => c.optInStatus === 'opted_in').length;

    return {
      total: totalCount,
      newToday: newTodayCount,
      active: activeCount
    };
  }, [contacts, totalCount]);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const lowerQuery = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.phone.toLowerCase().includes(lowerQuery)
    );
  }, [contacts, searchQuery]);

  // ── Row selection ─────────────────────────────────────────────────────────
  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.size === filteredContacts.length
        ? new Set()
        : new Set(filteredContacts.map(c => c.id))
    );
  };

  // ── CSV Import ────────────────────────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const result = parseCsv(raw);
      setImportResult(result);
      setShowModal(true);
    };
    reader.readAsText(file);
    // reset so the same file can be re-imported
    e.target.value = '';
  };

  const handleViewDirectory = () => setShowModal(false);
  const handleImportAnother = () => {
    setShowModal(false);
    setImportResult(null);
    setTimeout(() => fileInputRef.current?.click(), 150);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFB]">
      {/* ── TopBar ──────────────────────────────────────────────────────────── */}
      <TopBar
        breadcrumb={['CONNECTE', 'DIRECTORY']}
        onSync={handleSync}
        isSyncing={isSyncing}
        searchPlaceholder="Search directory..."
      />

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-12 py-10">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-[4rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">
              CONTACTS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              id="import-csv-btn"
              onClick={handleImportClick}
              className="flex items-center gap-2 h-12 px-8 border border-[#E8E8E8] bg-white text-[#1B1B1B] text-[11px] font-black tracking-widest uppercase hover:bg-[#F9F9F9] transition-all shadow-sm cursor-pointer"
            >
              <Upload size={14} /> IMPORT CSV
            </button>
            <button
              id="add-contact-btn"
              className="flex items-center gap-2 h-12 px-8 bg-[#1B1B1B] text-white text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all shadow-md cursor-pointer"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserPlus size={14} /> ADD CONTACT
            </button>
          </div>
        </div>

        {/* ── Stats Hero ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-0 mb-12 border border-[#E8E8E8] bg-white divide-x divide-[#E8E8E8]">
          <div className="p-8">
            <p className="text-[10px] font-black text-[#1B1B1B]/30 tracking-widest uppercase mb-2">TOTAL CONTACTS</p>
            <p className="text-4xl font-black text-[#1B1B1B] tracking-tight">{stats.total.toLocaleString()}</p>
          </div>
          <div className="p-8">
            <p className="text-[10px] font-black text-[#1B1B1B]/30 tracking-widest uppercase mb-2">ACTIVE NOW</p>
            <p className="text-4xl font-black text-[#25D366] tracking-tight">{stats.active.toLocaleString()}</p>
          </div>
          <div className="p-8">
            <p className="text-[10px] font-black text-[#1B1B1B]/30 tracking-widest uppercase mb-2">NEW TODAY</p>
            <p className="text-4xl font-black text-[#1B1B1B] tracking-tight">{stats.newToday.toLocaleString()}</p>
          </div>
          <div className="p-8">
            <p className="text-[10px] font-black text-[#1B1B1B]/30 tracking-widest uppercase mb-2">SYNC STATUS</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#25D366]" />
              <p className="text-sm font-black text-[#1B1B1B] tracking-widest uppercase">OPERATIONAL</p>
            </div>
          </div>
        </div>


        {/* ── Contacts Table ───────────────────────────────────────────────── */}
        <div className="bg-white border border-[#E8E8E8] mb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E8E8E8] hover:bg-transparent">
                <TableHead className="w-12 pl-6">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-[#1B1B1B] cursor-pointer"
                    checked={filteredContacts.length > 0 && selectedRows.size === filteredContacts.length}
                    onChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase">
                  CONTACT NAME
                </TableHead>
                <TableHead className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase">
                  PHONE NUMBER
                </TableHead>
                <TableHead className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase">
                  CLASSIFICATION
                </TableHead>
                <TableHead className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase text-right pr-6">
                  OPERATIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="text-[#25D366] animate-spin" />
                      <p className="text-[10px] font-black tracking-[0.25em] text-[#1B1B1B]/40 uppercase">
                        FETCHING_DATA
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : error ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <p className="text-[10px] font-black tracking-[0.25em] text-red-500 uppercase">
                      {error}
                    </p>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <p className="text-[10px] font-black tracking-[0.25em] text-[#1B1B1B]/40 uppercase">
                        NO_CONTACTS_FOUND
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map(contact => (
                    <TableRow
                      key={contact.id}
                      className="border-b border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                    >
                      <TableCell className="pl-6">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 accent-[#1B1B1B] cursor-pointer"
                          checked={selectedRows.has(contact.id)}
                          onChange={() => toggleRow(contact.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#1B1B1B] flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-white tracking-wider">
                              {contact.initials}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1B1B1B]">{contact.name}</p>
                            <p className="text-[10px] text-[#1B1B1B]/30 font-medium">{contact.updatedAt}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#1B1B1B] font-mono tracking-wide">
                        {contact.phone}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {contact.tags.map((tag, idx) => (
                            <TagChip key={idx} label={tag.label} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6" />
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>

          {/* Pagination row */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E8E8]">
            <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">
              DISPLAYING {filteredContacts.length} OF {totalCount.toLocaleString()} CONTACTS
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center border border-[#E8E8E8] text-[#1B1B1B]/40 hover:border-[#1B1B1B] hover:text-[#1B1B1B] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-8 h-8 flex items-center justify-center text-[11px] font-black transition-colors ${
                    currentPage === n
                      ? 'bg-[#1B1B1B] text-white'
                      : 'border border-[#E8E8E8] text-[#1B1B1B]/40 hover:border-[#1B1B1B] hover:text-[#1B1B1B]'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(3, p + 1))}
                className="w-8 h-8 flex items-center justify-center border border-[#E8E8E8] text-[#1B1B1B]/40 hover:border-[#1B1B1B] hover:text-[#1B1B1B] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom panels ────────────────────────────────────────────────── */}
        <div className={`grid ${availableTags.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-6 pb-8`}>
          {/* Quick Filters — dark card */}
          {availableTags.length > 0 && (
            <div className="bg-[#1B1B1B] p-8 relative overflow-hidden">
              {/* Decorative gear in background */}
              <div className="absolute right-4 bottom-4 opacity-5 text-white">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15.5a3.5 3.5 0 0 1 0-7 3.5 3.5 0 0 1 0 7zm7.43-2.09c.04-.3.07-.61.07-.91s-.03-.62-.07-.93l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.07.62-.07.92 0 .3.03.61.07.91l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58z"/>
                </svg>
              </div>
              <p className="text-[9px] font-black tracking-[0.25em] text-[#25D366] uppercase mb-4">
                CONTACT_FILTERS
              </p>
              <h2 className="text-2xl font-black text-white uppercase leading-tight mb-6">
                FILTER BY<br />CONTACT TAGS.
              </h2>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 border border-white/20 text-[9px] font-black tracking-widest text-white/60 uppercase hover:border-white/60 hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* System Notification — light card */}
          <div className="bg-white border border-[#E8E8E8] p-8">
            <p className="text-[9px] font-black tracking-[0.25em] text-[#1B1B1B]/40 uppercase mb-4">
              SYSTEM NOTIFICATION
            </p>
            <h2 className="text-lg font-bold text-[#1B1B1B] leading-snug mb-3">
              Unify your WhatsApp Business Account (WABA) and sync your Meta Cloud assets.
            </h2>
            <p className="text-xs text-[#1B1B1B]/50 leading-relaxed mb-6">
              Connect your Meta credentials to enable real-time template synchronization and high-performance contact broadcasts across the Connecte ecosystem.
            </p>
            <button className="flex items-center gap-3 group">
              <span className="text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase group-hover:text-[#25D366] transition-colors">
                CONFIGURE META ACCOUNT
              </span>
              <div className="h-[2px] w-10 bg-gradient-to-r from-[#006D2F] to-[#25D366]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Import Success Modal ─────────────────────────────────────────────── */}
      {showModal && importResult && (
        <ImportSuccessModal
          validRecords={importResult.validRecords}
          duplicatesSkipped={importResult.duplicatesSkipped}
          refId={importResult.refId}
          onViewDirectory={handleViewDirectory}
          onImportAnother={handleImportAnother}
        />
      )}
      {/* ── Add Contact Modal ────────────────────────────────────────────────── */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchContacts}
      />
    </div>
  );
}

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, UserPlus, Search, Bell, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ImportSuccessModal from '@/components/contacts/ImportSuccessModal';

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

// ── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  initials: string;
  updatedAt: string;
  phone: string;
  tags: { label: string; variant: 'solid' | 'green' | 'outline' }[];
}

// ── Dummy data (replaced by API later) ───────────────────────────────────────
const DUMMY_CONTACTS: Contact[] = [
  {
    id: '1', name: 'Jared Sterling', initials: 'JS', updatedAt: 'Updated 2d ago',
    phone: '+1 (555) 092-1184',
    tags: [{ label: 'ENTERPRISE', variant: 'solid' }, { label: 'ACTIVE', variant: 'outline' }],
  },
  {
    id: '2', name: 'Alena Mitchell', initials: 'AM', updatedAt: 'Updated 5d ago',
    phone: '+44 20 7946 0128',
    tags: [{ label: 'VIP', variant: 'green' }],
  },
  {
    id: '3', name: 'Rohan Khanna', initials: 'RK', updatedAt: 'Updated 1d ago',
    phone: '+91 98765 43210',
    tags: [{ label: 'LEADS', variant: 'outline' }, { label: 'NEW', variant: 'outline' }],
  },
  {
    id: '4', name: 'Sarah Lund', initials: 'SL', updatedAt: 'Updated 3d ago',
    phone: '+45 32 45 67 89',
    tags: [{ label: 'PARTNER', variant: 'solid' }],
  },
  {
    id: '5', name: 'Marcus Chen', initials: 'MC', updatedAt: 'Updated 6h ago',
    phone: '+1 (415) 555-0182',
    tags: [{ label: 'ENTERPRISE', variant: 'solid' }, { label: 'VIP', variant: 'green' }],
  },
  {
    id: '6', name: 'Priya Sharma', initials: 'PS', updatedAt: 'Updated 12h ago',
    phone: '+91 99876 54321',
    tags: [{ label: 'LEADS', variant: 'outline' }],
  },
];

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
function TagChip({ label, variant }: { label: string; variant: 'solid' | 'green' | 'outline' }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase';
  if (variant === 'green')   return <span className={`${base} bg-[#25D366] text-white`}>{label}</span>;
  if (variant === 'solid')   return <span className={`${base} bg-[#1B1B1B] text-white`}>{label}</span>;
  return <span className={`${base} border border-[#1B1B1B] text-[#1B1B1B]`}>{label}</span>;
}

// ── Page component ────────────────────────────────────────────────────────────
export default function Contacts() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [importResult, setImportResult] = useState<ParsedResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const totalContacts = 2841;
  const activeNow     = 158;
  const newToday      = 12;

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
      prev.size === DUMMY_CONTACTS.length
        ? new Set()
        : new Set(DUMMY_CONTACTS.map(c => c.id))
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
    <div className="flex flex-col h-full">

      {/* ── TopBar ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between h-14 px-8 bg-white border-b border-[#E8E8E8] shrink-0">
        <nav className="flex items-center gap-1 text-[11px] font-black tracking-widest text-[#1B1B1B]/40 uppercase">
          <span
            className="hover:text-[#1B1B1B] cursor-pointer transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            CONNECTE
          </span>
          <span className="mx-1 text-[#1B1B1B]/20">/</span>
          <span className="text-[#1B1B1B]">DIRECTORY</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F3F3F3] px-3 h-9 w-48">
            <Search size={13} className="text-[#1B1B1B]/40 shrink-0" />
            <input
              type="text"
              placeholder="Search directory..."
              className="bg-transparent text-sm text-[#1B1B1B] placeholder:text-[#1B1B1B]/40 outline-none w-full"
            />
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/40 hover:text-[#1B1B1B]">
            <Bell size={17} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/40 hover:text-[#1B1B1B]">
            <HelpCircle size={17} />
          </button>
        </div>
      </header>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-8">

        {/* ── Page heading row ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] text-[#1B1B1B]/40 uppercase mb-1">
              CENTRAL NODE
            </p>
            <h1 className="text-[3rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">
              DIRECTORY
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
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
              className="flex items-center gap-2 h-11 px-6 border border-[#1B1B1B] text-[#1B1B1B] text-[11px] font-black tracking-widest uppercase hover:bg-[#F3F3F3] transition-colors"
            >
              <Upload size={14} /> IMPORT CSV
            </button>
            <button
              id="add-contact-btn"
              className="flex items-center gap-2 h-11 px-6 bg-[#1B1B1B] text-white text-[11px] font-black tracking-widest uppercase opacity-80 cursor-not-allowed"
              disabled
            >
              <UserPlus size={14} /> ADD CONTACT
            </button>
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-px bg-[#E8E8E8] border border-[#E8E8E8] mb-6">
          <div className="bg-white px-8 py-5">
            <p className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase mb-2">TOTAL CONTACTS</p>
            <p className="text-3xl font-black text-[#1B1B1B]">{totalContacts.toLocaleString()}</p>
          </div>
          <div className="bg-white px-8 py-5">
            <p className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase mb-2">ACTIVE NOW</p>
            <p className="text-3xl font-black text-[#25D366]">{activeNow}</p>
          </div>
          <div className="bg-white px-8 py-5">
            <p className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase mb-2">NEW TODAY</p>
            <p className="text-3xl font-black text-[#1B1B1B]">{newToday}</p>
          </div>
          <div className="bg-white px-8 py-5">
            <p className="text-[9px] font-black tracking-[0.2em] text-[#1B1B1B]/40 uppercase mb-2">SYNC STATUS</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-[#25D366] rounded-full" />
              <p className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider">OPERATIONAL</p>
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
                    checked={selectedRows.size === DUMMY_CONTACTS.length}
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
            <TableBody>
              {DUMMY_CONTACTS.map(contact => (
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
                      {contact.tags.map(tag => (
                        <TagChip key={tag.label} label={tag.label} variant={tag.variant} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {/* Operations — empty for now */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination row */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E8E8]">
            <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">
              DISPLAYING 1–{DUMMY_CONTACTS.length} OF {totalContacts.toLocaleString()} NODES
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
        <div className="grid grid-cols-2 gap-6 pb-8">
          {/* Quick Filters — dark card */}
          <div className="bg-[#1B1B1B] p-8 relative overflow-hidden">
            {/* Decorative gear in background */}
            <div className="absolute right-4 bottom-4 opacity-5 text-white">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15.5a3.5 3.5 0 0 1 0-7 3.5 3.5 0 0 1 0 7zm7.43-2.09c.04-.3.07-.61.07-.91s-.03-.62-.07-.93l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.07.62-.07.92 0 .3.03.61.07.91l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.07-.47-.12-.61l-2.01-1.58z"/>
              </svg>
            </div>
            <p className="text-[9px] font-black tracking-[0.25em] text-[#25D366] uppercase mb-4">
              QUICK FILTERS
            </p>
            <h2 className="text-2xl font-black text-white uppercase leading-tight mb-6">
              ORGANIZE YOUR<br />COMMUNICATIONS.
            </h2>
            <div className="flex flex-wrap gap-2">
              {['VIP CLIENTS', 'PENDING BROADCAST', 'SUPPORT QUEUE', 'INACTIVE 30D'].map(filter => (
                <button
                  key={filter}
                  className="px-4 py-2 border border-white/20 text-[9px] font-black tracking-widest text-white/60 uppercase hover:border-white/60 hover:text-white transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* System Notification — light card */}
          <div className="bg-white border border-[#E8E8E8] p-8">
            <p className="text-[9px] font-black tracking-[0.25em] text-[#1B1B1B]/40 uppercase mb-4">
              SYSTEM NOTIFICATION
            </p>
            <h2 className="text-lg font-bold text-[#1B1B1B] leading-snug mb-3">
              Integrate your Meta Cloud API to automatically sync new leads from your business profile.
            </h2>
            <p className="text-xs text-[#1B1B1B]/50 leading-relaxed mb-6">
              Direct synchronization ensures no data loss and real-time classification of incoming communication nodes.
            </p>
            <button className="flex items-center gap-3 group">
              <span className="text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase group-hover:text-[#25D366] transition-colors">
                CONFIGURE INTEGRATION
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
    </div>
  );
}

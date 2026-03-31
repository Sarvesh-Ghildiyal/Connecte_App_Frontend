import { useState, useMemo } from 'react';
import { Search, Filter, Users, Star, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Contact } from '../Broadcast';

interface Step2Props {
  contacts: Contact[];
  selectedContactIds: Set<string>;
  onSelectContacts: (ids: Set<string>) => void;
  onNext: () => void;
  onBack: () => void;
  templateCategory?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
}

const SEGMENTS = [
  { id: 'all', title: 'All Contacts', description: 'Total database reach including all verified numbers.', count: 4821, icon: Users, tag: null },
  { id: 'vip', title: 'VIP Customers', description: 'Users with > 5 purchases in the last 6 months.', count: 342, icon: Star, tag: 'VIP' },
  { id: 'churn', title: 'Churn Risk', description: 'No activity detected in the last 30 days.', count: 896, icon: AlertTriangle, tag: 'CHURN_RISK' },
];

const RATES = {
  MARKETING: 0.82,
  UTILITY: 0.35,
  AUTHENTICATION: 0.12,
};

export function Step2AudienceSelection({ 
  contacts, 
  selectedContactIds, 
  onSelectContacts, 
  onNext, 
  onBack,
  templateCategory = 'MARKETING'
}: Step2Props) {
  const [activeSegment, setActiveSegment] = useState('all');

  const handleSelectSegment = (segmentId: string, tag: string | null) => {
    setActiveSegment(segmentId);
    if (!tag) {
      // Select all
      onSelectContacts(new Set(contacts.map(c => c.id)));
    } else {
      // Select by tag
      const filtered = contacts.filter(c => c.tags.includes(tag)).map(c => c.id);
      onSelectContacts(new Set(filtered));
    }
  };

  const handleToggleContact = (id: string) => {
    const next = new Set(selectedContactIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectContacts(next);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) onSelectContacts(new Set(contacts.map(c => c.id)));
    else onSelectContacts(new Set());
  };

  const totalCost = selectedContactIds.size * RATES[templateCategory];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Heading */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#25D366] uppercase">
            STAGE 02 OF 03
          </p>
          <h1 className="text-[3.5rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">
            SELECT AUDIENCE
          </h1>
        </div>
        <div className="flex flex-col items-end border-l-4 border-[#25D366] pl-6 py-2">
           <p className="text-[10px] font-black tracking-widest text-[#1B1B1B]/40 uppercase mb-1">Total Recipients</p>
           <p className="text-[2.5rem] font-black text-[#1B1B1B] leading-none">{selectedContactIds.size.toLocaleString()}</p>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-6">
        <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Audience Segments</p>
        <div className="grid grid-cols-3 gap-6">
          {SEGMENTS.map((seg) => {
            const isActive = activeSegment === seg.id;
            const Icon = seg.icon;
            return (
              <button
                key={seg.id}
                onClick={() => handleSelectSegment(seg.id, seg.tag)}
                className={`p-10 text-left transition-all relative overflow-hidden flex flex-col items-start gap-4 ${
                  isActive ? 'ring-2 ring-[#25D366] bg-white' : 'ring-1 ring-[#E8E8E8] bg-white hover:ring-[#1B1B1B]/20'
                }`}
              >
                {isActive && <span className="absolute top-0 left-0 w-1.5 h-full bg-[#25D366]" />}
                <div className="flex justify-between items-center w-full">
                  <div className={`w-10 h-10 flex items-center justify-center ${isActive ? 'bg-[#1B1B1B]' : 'bg-[#F3F3F3]'}`}>
                    <Icon size={20} className={isActive ? 'text-[#25D366]' : 'text-[#1B1B1B]'} />
                  </div>
                  <span className={`px-2 py-1 text-[8px] font-black tracking-widest uppercase ${isActive ? 'bg-[#25D366] text-white' : 'bg-[#F3F3F3] text-[#1B1B1B]/30'}`}>
                    {seg.id === 'all' ? 'ACTIVE' : 'PRESET'}
                  </span>
                </div>
                <div>
                   <h3 className="text-xl font-black text-[#1B1B1B] uppercase mb-2 tracking-tight">{seg.title}</h3>
                   <p className="text-[11px] text-[#1B1B1B]/40 leading-relaxed mb-4">{seg.description}</p>
                   <p className="text-[10px] font-black text-[#1B1B1B] tracking-widest uppercase">{seg.count.toLocaleString()} Members</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Selection Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Individual Contacts</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-4 h-10 w-96 border border-[#E8E8E8]">
              <Search size={14} className="text-[#1B1B1B]/30" />
              <input type="text" placeholder="SEARCH BY NAME OR NUMBER..." className="bg-transparent text-[10px] font-bold tracking-widest outline-none w-full uppercase" />
            </div>
            <button className="h-10 px-6 border border-[#E8E8E8] bg-white flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-[#1B1B1B] hover:bg-[#F3F3F3]">
               <Filter size={12} /> FILTER TAGS
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#E8E8E8]">
          <Table>
            <TableHeader className="bg-[#1B1B1B]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-16">
                  <Checkbox 
                    className="border-white/20 data-[state=checked]:bg-[#25D366] data-[state=checked]:text-black"
                    checked={selectedContactIds.size === contacts.length}
                    onCheckedChange={(c) => handleSelectAll(!!c)}
                  />
                </TableHead>
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Contact Name</TableHead>
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Phone Number</TableHead>
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Tags</TableHead>
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase text-right px-8">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-[#F9F9F9] h-16 transition-colors">
                  <TableCell>
                     <Checkbox 
                        className="data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366]"
                        checked={selectedContactIds.has(contact.id)}
                        onCheckedChange={() => handleToggleContact(contact.id)}
                     />
                  </TableCell>
                  <TableCell className="text-[11px] font-black text-[#1B1B1B] uppercase tracking-wide">{contact.name}</TableCell>
                  <TableCell className="text-[11px] font-semibold text-[#1B1B1B]/50">{contact.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {contact.tags.map(tag => (
                         <span key={tag} className="px-2 py-1 bg-[#F3F3F3] text-[8px] font-black tracking-[0.1em] text-[#1B1B1B]/40 uppercase">{tag}</span>
                       ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                     <div className="flex items-center justify-end gap-2">
                        <span className={`w-1.5 h-1.5 ${contact.status === 'ACTIVE' ? 'bg-[#25D366]' : 'bg-[#E8E8E8]'}`} />
                        <span className="text-[9px] font-black text-[#1B1B1B] tracking-widest uppercase">{contact.status}</span>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

       {/* Footer Navigation */}
       <div className="fixed bottom-0 left-[240px] right-0 h-24 bg-white border-t border-[#E8E8E8] px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-12">
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Selected Audience</p>
             <p className="text-lg font-black text-[#1B1B1B] uppercase">{selectedContactIds.size.toLocaleString()} Recipients</p>
          </div>
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Estimated Cost</p>
             <p className="text-lg font-black text-[#1B1B1B] uppercase">₹ {totalCost.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="h-12 px-12 border border-[#E8E8E8] text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase hover:bg-black hover:text-white hover:border-black transition-all">
            BACK
          </button>
          <button
            onClick={onNext}
            disabled={selectedContactIds.size === 0}
            className="h-12 px-12 bg-[#1B1B1B] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#25D366] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            NEXT STEP: CONTENT
          </button>
        </div>
      </div>
    </div>
  );
}

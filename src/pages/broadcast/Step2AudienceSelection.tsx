import { useMemo } from 'react';
import { Search, Users, Tag, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Contact, TemplateCategory } from '@/types';

interface Step2Props {
  contacts: Contact[];
  isLoading: boolean;
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  templateCategory?: TemplateCategory;
}

const RATES = {
  MARKETING: 0.82,
  UTILITY: 0.35,
  AUTHENTICATION: 0.12,
  TRANSACTIONAL: 0.35,
};

export function Step2AudienceSelection({ 
  contacts, 
  isLoading,
  selectedTags, 
  onSelectTags, 
  onNext, 
  onBack,
  templateCategory = 'MARKETING'
}: Step2Props) {
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach(c => c.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [contacts]);

  const selectedContactCount = useMemo(() => {
    if (selectedTags.length === 0) return 0;
    return contacts.filter(c => c.tags.some(t => selectedTags.includes(t))).length;
  }, [contacts, selectedTags]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelectTags(selectedTags.filter(t => t !== tag));
    } else {
      onSelectTags([...selectedTags, tag]);
    }
  };

  const totalCost = selectedContactCount * (RATES[templateCategory] || 0.82);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Heading */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#25D366] uppercase">
            STAGE 02 OF 04
          </p>
          <h1 className="text-[3.5rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">
            SELECT AUDIENCE
          </h1>
        </div>
        <div className="flex flex-col items-end border-l-4 border-[#25D366] pl-6 py-2">
           <p className="text-[10px] font-black tracking-widest text-[#1B1B1B]/40 uppercase mb-1">Total Recipients</p>
           <p className="text-[2.5rem] font-black text-[#1B1B1B] leading-none">
             {isLoading ? '...' : selectedContactCount.toLocaleString()}
           </p>
        </div>
      </div>

      {/* Tag Selection Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Selection by Tags</p>
          <div className="flex items-center gap-2 bg-white px-4 h-10 w-64 border border-[#E8E8E8]">
            <Search size={14} className="text-[#1B1B1B]/30" />
            <input type="text" placeholder="FILTER TAGS..." className="bg-transparent text-[10px] font-bold tracking-widest outline-none w-full uppercase" />
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-48 flex items-center justify-center bg-white border border-[#E8E8E8]">
            <Loader2 className="animate-spin text-[#25D366]" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const count = contacts.filter(c => c.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`p-6 text-left transition-all relative overflow-hidden flex flex-col gap-2 ${
                    isSelected ? 'ring-2 ring-[#25D366] bg-white' : 'ring-1 ring-[#E8E8E8] bg-white hover:ring-[#1B1B1B]/20'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <Tag size={14} className={isSelected ? 'text-[#25D366]' : 'text-[#1B1B1B]/20'} />
                    <Checkbox checked={isSelected} className="data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#1B1B1B] uppercase tracking-widest truncate">{tag}</p>
                    <p className="text-[9px] font-bold text-[#1B1B1B]/30 uppercase tracking-widest">{count} Contacts</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Table */}
      <div className="space-y-6">
        <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Audience Preview (Matched Contacts)</p>
        <div className="bg-white border border-[#E8E8E8]">
          <Table>
            <TableHeader className="bg-[#1B1B1B]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Contact Name</TableHead>
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Phone Number</TableHead>
                <TableHead className="text-[10px] font-black tracking-widest text-white uppercase text-right px-8">Reach</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.filter(c => c.tags.some(t => selectedTags.includes(t))).slice(0, 5).map((contact) => (
                <TableRow key={contact.id} className="hover:bg-[#F9F9F9] h-12 transition-colors">
                  <TableCell className="text-[11px] font-black text-[#1B1B1B] uppercase tracking-wide">{contact.name || 'Anonymous'}</TableCell>
                  <TableCell className="text-[11px] font-semibold text-[#1B1B1B]/50">{contact.phone_number}</TableCell>
                  <TableCell className="text-right px-8">
                     <span className="text-[9px] font-black text-[#25D366] tracking-widest uppercase">Verified</span>
                  </TableCell>
                </TableRow>
              ))}
              {selectedContactCount > 5 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 bg-[#F9F9F9] text-[9px] font-black text-[#1B1B1B]/20 uppercase tracking-[0.2em]">
                    + {selectedContactCount - 5} More Contacts in Selection
                  </TableCell>
                </TableRow>
              )}
              {selectedContactCount === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-[10px] font-bold text-[#1B1B1B]/30 uppercase tracking-widest">
                    No tags selected. Select tags above to build audience.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

       {/* Footer Navigation */}
       <div className="fixed bottom-0 left-[240px] right-0 h-24 bg-white border-t border-[#E8E8E8] px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-12">
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Selected Audience</p>
             <p className="text-lg font-black text-[#1B1B1B] uppercase">{selectedContactCount.toLocaleString()} Recipients</p>
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
            disabled={selectedContactCount === 0}
            className="h-12 px-12 bg-[#1B1B1B] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#25D366] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            NEXT STEP: CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
}

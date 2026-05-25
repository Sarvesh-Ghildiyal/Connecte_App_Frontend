import { useMemo, useState } from 'react';
import { Search, Tag, Loader2, Users, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Contact, TemplateCategory } from '@/types';

interface Step2Props {
  contacts: Contact[];
  isLoading: boolean;
  selectionMode: 'tags' | 'contacts';
  onSelectionModeChange: (mode: 'tags' | 'contacts') => void;
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
  selectedContactIds: string[];
  onSelectContactIds: (ids: string[]) => void;
  excludedContactIds: string[];
  onExcludeContactIds: (ids: string[]) => void;
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
  selectionMode,
  onSelectionModeChange,
  selectedTags, 
  onSelectTags, 
  selectedContactIds,
  onSelectContactIds,
  excludedContactIds,
  onExcludeContactIds,
  onNext, 
  onBack,
  templateCategory = 'MARKETING'
}: Step2Props) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.filter(c => !c.is_deleted).forEach(c => c.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      !c.is_deleted && (
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.phone_number.includes(searchQuery)
      )
    );
  }, [contacts, searchQuery]);

  const selectedContactCount = useMemo(() => {
    if (selectionMode === 'contacts') {
      return selectedContactIds.length;
    }
    if (selectedTags.length === 0) return 0;
    return contacts.filter(c => !c.is_deleted && c.tags.some(t => selectedTags.includes(t)) && !excludedContactIds.includes(c.id)).length;
  }, [contacts, selectedTags, selectionMode, selectedContactIds, excludedContactIds]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelectTags(selectedTags.filter(t => t !== tag));
    } else {
      onSelectTags([...selectedTags, tag]);
    }
  };

  const handleToggleContact = (id: string) => {
    if (selectedContactIds.includes(id)) {
      onSelectContactIds(selectedContactIds.filter(cid => cid !== id));
    } else {
      onSelectContactIds([...selectedContactIds, id]);
    }
  };

  const handleToggleExclude = (id: string) => {
    if (excludedContactIds.includes(id)) {
      onExcludeContactIds(excludedContactIds.filter(cid => cid !== id));
    } else {
      onExcludeContactIds([...excludedContactIds, id]);
    }
  };

  const totalCost = selectedContactCount * (RATES[templateCategory] || 0.82);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Heading */}
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#25D366] uppercase">
              STAGE 02 OF 04
            </p>
            <h1 className="text-[3.5rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">
              SELECT AUDIENCE
            </h1>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex bg-white border border-[#E8E8E8] p-1 w-fit">
            <button 
              onClick={() => onSelectionModeChange('tags')}
              className={`px-6 h-10 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                selectionMode === 'tags' ? 'bg-[#1B1B1B] text-white' : 'text-[#1B1B1B]/40 hover:text-[#1B1B1B]'
              }`}
            >
              <Tag size={12} /> BY TAGS
            </button>
            <button 
              onClick={() => onSelectionModeChange('contacts')}
              className={`px-6 h-10 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                selectionMode === 'contacts' ? 'bg-[#1B1B1B] text-white' : 'text-[#1B1B1B]/40 hover:text-[#1B1B1B]'
              }`}
            >
              <Users size={12} /> PICK CONTACTS
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end border-l-4 border-[#25D366] pl-6 py-2">
           <p className="text-[10px] font-black tracking-widest text-[#1B1B1B]/40 uppercase mb-1">Total Recipients</p>
           <p className="text-[2.5rem] font-black text-[#1B1B1B] leading-none">
             {isLoading ? '...' : selectedContactCount.toLocaleString()}
           </p>
        </div>
      </div>

      {selectionMode === 'tags' ? (
        /* Tag Selection Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Selection by Tags</p>
            <div className="flex items-center gap-2 bg-white px-4 h-10 w-64 border border-[#E8E8E8]">
              <Search size={14} className="text-[#1B1B1B]/30" />
              <input 
                type="text" 
                placeholder="FILTER TAGS..." 
                className="bg-transparent text-[10px] font-bold tracking-widest outline-none w-full uppercase" 
              />
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
                const count = contacts.filter(c => !c.is_deleted && c.tags.includes(tag)).length;
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
      ) : (
        /* Contact Selection Table */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Selection by Individuals</p>
            <div className="flex items-center gap-2 bg-white px-4 h-10 w-64 border border-[#E8E8E8]">
              <Search size={14} className="text-[#1B1B1B]/30" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH CONTACTS..." 
                className="bg-transparent text-[10px] font-bold tracking-widest outline-none w-full uppercase" 
              />
            </div>
          </div>

          <div className="bg-white border border-[#E8E8E8] max-h-[500px] overflow-y-auto relative">
            <Table>
              <TableHeader className="bg-[#1B1B1B] sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Contact Name</TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Phone Number</TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    className="hover:bg-[#F9F9F9] h-12 transition-colors cursor-pointer"
                    onClick={() => handleToggleContact(contact.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedContactIds.includes(contact.id)}
                        onCheckedChange={() => handleToggleContact(contact.id)}
                        className="data-[state=checked]:bg-[#1B1B1B] data-[state=checked]:border-[#1B1B1B]"
                      />
                    </TableCell>
                    <TableCell className="text-[11px] font-black text-[#1B1B1B] uppercase tracking-wide">
                      {contact.name || 'Anonymous'}
                    </TableCell>
                    <TableCell className="text-[11px] font-semibold text-[#1B1B1B]/50">{contact.phone_number}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.map(t => (
                          <span key={t} className="text-[8px] font-black px-2 py-0.5 bg-[#F3F3F3] text-[#1B1B1B]/40 uppercase tracking-tighter">
                            {t}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredContacts.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-[10px] font-bold text-[#1B1B1B]/30 uppercase tracking-widest">
                      {searchQuery ? 'NO CONTACTS MATCHED THIS SEARCH' : 'NO CONTACTS FOUND'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Preview Table (Only in Tag Mode) */}
      {selectionMode === 'tags' && (
        <div className="space-y-6">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Audience Tuning (Uncheck to Exclude)</p>
          <div className="bg-white border border-[#E8E8E8] max-h-[300px] overflow-y-auto relative">
            <Table>
              <TableHeader className="bg-[#1B1B1B] sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Contact Name</TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest text-white uppercase">Phone Number</TableHead>
                  <TableHead className="text-[10px] font-black tracking-widest text-white uppercase text-right px-8">Reach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.filter(c => !c.is_deleted && c.tags.some(t => selectedTags.includes(t))).map((contact) => {
                  const isExcluded = excludedContactIds.includes(contact.id);
                  return (
                    <TableRow 
                      key={contact.id} 
                      className="hover:bg-[#F9F9F9] h-12 transition-colors cursor-pointer"
                      onClick={() => handleToggleExclude(contact.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={!isExcluded}
                          onCheckedChange={() => handleToggleExclude(contact.id)}
                          className="data-[state=checked]:bg-[#1B1B1B] data-[state=checked]:border-[#1B1B1B]"
                        />
                      </TableCell>
                      <TableCell className="text-[11px] font-black text-[#1B1B1B] uppercase tracking-wide">
                        {contact.name || 'Anonymous'}
                      </TableCell>
                      <TableCell className="text-[11px] font-semibold text-[#1B1B1B]/50">{contact.phone_number}</TableCell>
                      <TableCell className="text-right px-8">
                        <span className="text-[9px] font-black text-[#25D366] tracking-widest uppercase flex items-center justify-end gap-1">
                          Verified <Check size={10} />
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {contacts.filter(c => !c.is_deleted && c.tags.some(t => selectedTags.includes(t))).length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-[10px] font-bold text-[#1B1B1B]/30 uppercase tracking-widest">
                      No tags selected. Select tags above to build audience.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

       {/* Footer Navigation */}
       <div className="fixed bottom-0 left-[240px] right-0 h-24 bg-white border-t border-[#E8E8E8] px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-12">
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Selected Audience</p>
             <p className="text-lg font-black text-[#1B1B1B] uppercase">{selectedContactCount.toLocaleString()} Recipients</p>
          </div>
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Estimated Cost</p>
             <p className="text-lg font-black text-[#25D366] uppercase">₹ {totalCost.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="h-12 px-12 border border-[#E8E8E8] text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase hover:bg-black hover:text-white hover:border-black transition-all">
            BACK
          </button>
          <button
            onClick={onNext}
            disabled={selectedContactCount === 0}
            className="h-12 px-12 bg-[#1B1B1B] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#25D366] hover:text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            NEXT STEP: CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
}

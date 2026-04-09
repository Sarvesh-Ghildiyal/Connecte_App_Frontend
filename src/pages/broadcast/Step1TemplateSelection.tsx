import { useState } from 'react';
import { Search, Check, Plus } from 'lucide-react';
import type { Template } from '@/types';

interface Step1Props {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (t: Template) => void;
  onNext: () => void;
}

export function Step1TemplateSelection({ templates, selectedTemplate, onSelect, onNext }: Step1Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getBodyPreview = (template: Template) => {
    const body = template.components.find(c => c.type === 'BODY');
    return body?.text || 'No preview available';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Page Heading */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#25D366] uppercase">
          WIZARD PHASE 01
        </p>
        <h1 className="text-[3.5rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">
          CHOOSE YOUR TOOL
        </h1>
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-4">
        <div className="flex items-center gap-8">
          {['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION', 'TRANSACTIONAL'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveCategory(tab)}
              className={`text-[11px] font-black tracking-widest uppercase transition-colors ${tab === activeCategory ? 'text-[#1B1B1B]' : 'text-[#1B1B1B]/30'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#F3F3F3] px-4 h-10 w-64">
          <Search size={14} className="text-[#1B1B1B]/30" />
          <input 
            type="text" 
            placeholder="SEARCH TEMPLATES..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[10px] font-bold tracking-widest outline-none w-full uppercase" 
          />
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div 
              key={template.id} 
              className={`flex flex-col h-full bg-white transition-all overflow-hidden relative ${
                isSelected ? 'ring-2 ring-[#25D366]' : 'ring-1 ring-inset ring-[#E8E8E8]'
              }`}
            >
              <div className="p-8 flex flex-col h-full">
                {/* Category & Language */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase ${
                      template.category === 'MARKETING' ? 'bg-[#1B1B1B]' : 'bg-[#25D366]'
                    }`}>
                      {template.category}
                    </span>
                    <span className="px-3 py-1 text-[9px] font-black tracking-widest text-[#1B1B1B]/40 border border-[#E8E8E8] uppercase">
                      {template.language}
                    </span>
                  </div>
                  {isSelected && <Check size={18} className="text-[#25D366]" />}
                </div>

                <h3 className="text-2xl font-black text-[#1B1B1B] uppercase mb-4 leading-tight">
                  {template.name.replace(/_/g, ' ')}
                </h3>
                
                <p className="text-xs text-[#1B1B1B]/50 leading-relaxed mb-auto line-clamp-3">
                  {getBodyPreview(template)}
                </p>

                <button
                  onClick={() => onSelect(template)}
                  className={`mt-8 h-12 w-full text-[11px] font-black tracking-[0.2em] uppercase transition-colors ${
                    isSelected 
                      ? 'bg-[#25D366] text-white' 
                      : 'bg-[#1B1B1B] text-white hover:bg-black'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'SELECT'}
                </button>
              </div>
            </div>
          );
        })}

        {/* Custom Build UI Placeholder */}
        <div className="bg-[#1B1B1B] p-8 flex flex-col items-center justify-center text-center text-white min-h-[400px]">
          <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center mb-6">
            <Plus size={24} className="text-black" />
          </div>
          <h3 className="text-2xl font-black uppercase mb-4">Custom Build</h3>
          <p className="text-xs text-white/40 leading-relaxed max-w-[200px] mb-8">
            Design your own surgical template from absolute scratch.
          </p>
          <button className="h-12 w-48 border border-white/20 text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
            START BUILD
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-[240px] right-0 h-20 bg-white border-t border-[#E8E8E8] px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-8">
          <p className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase tracking-widest">
            Currently Viewing <span className="text-[#1B1B1B] ml-2">{filteredTemplates.length} Templates available</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#25D366]" />
            <p className="text-[10px] font-bold text-[#1B1B1B] uppercase tracking-widest">API LIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[10px] font-black tracking-widest text-[#1B1B1B]/30 hover:text-[#1B1B1B] uppercase px-8 transition-colors">
            CANCEL
          </button>
          <button
            onClick={onNext}
            disabled={!selectedTemplate}
            className="h-12 px-12 bg-[#1B1B1B] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#25D366] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            CONTINUE TO CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
}

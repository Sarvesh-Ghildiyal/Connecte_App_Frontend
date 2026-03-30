import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Search, Bell, HelpCircle, Megaphone, Smartphone, ExternalLink, Phone, Copy, CheckCircle2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Page: /templates/create  (page3a.png + Meta production screenshots)
//
// Features: 
//   - Variable Samples (dynamically maps {{n}} to sample inputs)
//   - Call to Action Buttons (Visit Website, Call Phone Number)
//   - Interactive Phone Preview with green bolded placeholders
// ─────────────────────────────────────────────────────────────────────────────

type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

type ButtonType = 'visit_website' | 'call_phone_number' | 'copy_offer_code' | 'none';

interface ButtonRow {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  country?: string;
  phone?: string;
}

const LANGUAGES = [
  'English (US)',
  'English (UK)',
  'Hindi',
  'Spanish (ES)',
  'Portuguese (BR)',
];

const categories: TemplateCategory[] = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];

export default function CreateTemplate() {
  const navigate = useNavigate();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [category, setCategory]         = useState<TemplateCategory>('MARKETING');
  const [templateName, setTemplateName] = useState('testing_name');
  const [language, setLanguage]         = useState('English');
  const [headerContent, setHeaderContent] = useState('testing one for AI');
  const [bodyMessage, setBodyMessage]     = useState('Hello this is the body and {{1}} how it populates in the live preview');
  const [footerText, setFooterText]       = useState('this is footer and how it is shown in whatsapp');
  
  // ── Variable Mapping & Samples ──────────────────────────────────────────────
  const [variableSamples, setVariableSamples] = useState<Record<string, string>>({
    '{{1}}': 'this is where variable are mapped'
  });

  // ── Buttons ─────────────────────────────────────────────────────────────────
  const [buttons, setButtons] = useState<ButtonRow[]>([
    { id: '1', type: 'visit_website', text: 'button and categories', url: 'https://button' }
  ]);

  const bodyMax = 1024;

  // ── Effect: Auto-scan body for {{n}} variables ──────────────────────────────
  useEffect(() => {
    const matches = bodyMessage.match(/\{\{\d+\}\}/g) || [];
    const uniqueMatches = Array.from(new Set(matches));
    
    setVariableSamples(prev => {
      const next: Record<string, string> = {};
      uniqueMatches.forEach(key => {
        next[key] = prev[key] || '';
      });
      return next;
    });
  }, [bodyMessage]);

  const addPlaceholder = () => {
    const matches = bodyMessage.match(/\{\{(\d+)\}\}/g) || [];
    const nextIndex = matches.length + 1;
    setBodyMessage(prev => prev + ` {{${nextIndex}}}`);
  };

  const updateVariableSample = (key: string, val: string) => {
    setVariableSamples(prev => ({ ...prev, [key]: val }));
  };

  const addButton = (type: ButtonType) => {
    if (buttons.length >= 10) return;
    setButtons([...buttons, { 
      id: crypto.randomUUID(), 
      type, 
      text: type === 'call_phone_number' ? 'Call phone number' : 'Visit website',
      url: '', 
      country: '+1', 
      phone: '' 
    }]);
  };

  const removeButton = (id: string) => {
    setButtons(buttons.filter(b => b.id !== id));
  };

  const updateButton = (id: string, fields: Partial<ButtonRow>) => {
    setButtons(buttons.map(b => b.id === id ? { ...b, ...fields } : b));
  };

  // ── Live Preview Substitution ───────────────────────────────────────────────
  const renderPreviewBody = () => {
    const parts = bodyMessage.split(/(\{\{\d+\}\})/g);
    return parts.map((part, i) => {
      if (part.match(/\{\{\d+\}\}/)) {
        const sample = variableSamples[part] || part;
        return (
          <span key={i} className="text-[#25D366] font-bold">
            [{sample}]
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9]">

      {/* ── Page Header (per-page TopBar variant) ───────────────────────────── */}
      <header className="flex items-center justify-between h-14 px-8 bg-white border-b border-[#E8E8E8] shrink-0">
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <CheckCircle2 size={16} className="text-[#25D366]" />
          <span className="text-[#1B1B1B]/40 ml-1">Set up template</span>
          <div className="w-4 h-4 rounded-full border-2 border-[#1B1B1B] border-r-transparent animate-spin ml-4"></div>
          <span className="text-[#1B1B1B] ml-1">Edit template</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#1B1B1B]/20 ml-4"></div>
          <span className="text-[#1B1B1B]/40 ml-1">Submit for review</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F3F3F3] px-3 h-9 w-44">
            <Search size={13} className="text-[#1B1B1B]/40 shrink-0" />
            <input type="text" placeholder="Search system..." className="bg-transparent text-sm text-[#1B1B1B] placeholder:text-[#1B1B1B]/40 outline-none w-full" />
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/40 hover:text-[#1B1B1B]"><Bell size={17} /></button>
          <button className="w-8 h-8 flex items-center justify-center text-[#1B1B1B]/40 hover:text-[#1B1B1B]"><HelpCircle size={17} /></button>
        </div>
      </header>

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[1fr_360px] min-h-full">

          {/* ── LEFT COLUMN: Form ───────────────────────────────────────────── */}
          <div className="px-10 py-8 border-r border-[#E8E8E8]">
            
            {/* Meta-style Template Info Header */}
            <div className="flex items-center gap-4 mb-8 bg-[#F3F3F3] p-4">
              <div className="w-10 h-10 bg-[#006D2F] flex items-center justify-center">
                <Megaphone size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-tight">
                  {templateName} • {language}
                </h1>
                <p className="text-[10px] text-[#1B1B1B]/40 font-semibold tracking-widest uppercase">
                  Marketing • Default
                </p>
              </div>
            </div>

            {/* Template Name & Language Section */}
            <div className="mb-10">
              <h2 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-wider mb-6">Template name and language</h2>
              <div className="grid grid-cols-2 gap-6 bg-white border border-[#E8E8E8] p-6">
                <div>
                  <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase block mb-2 tracking-widest">Name your template</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    className="w-full h-11 px-4 bg-[#F3F3F3] text-sm text-[#1B1B1B] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase block mb-2 tracking-widest">Select language</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full h-11 px-4 bg-[#F3F3F3] text-sm text-[#1B1B1B] outline-none appearance-none"
                  >
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="mb-10">
              <h2 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-wider mb-2">Content</h2>
              <p className="text-xs text-[#1B1B1B]/50 mb-6 leading-relaxed">
                Add a header, body and footer for your template. Cloud API hosted by Meta will review the template variables and content to protect the security and integrity of our services.
              </p>

              <div className="space-y-6 bg-white border border-[#E8E8E8] p-8">
                {/* Header Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase tracking-widest leading-none">Header · Optional</label>
                    <span className="text-[10px] text-[#1B1B1B]/30 uppercase font-semibold">{headerContent.length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={headerContent}
                    onChange={e => setHeaderContent(e.target.value)}
                    className="w-full h-11 px-4 bg-[#F3F3F3] text-sm text-[#1B1B1B] outline-none"
                    placeholder="testing one for AI"
                  />
                </div>

                {/* Body Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase tracking-widest leading-none">Body</label>
                    <span className="text-[10px] text-[#1B1B1B]/30 uppercase font-semibold">{bodyMessage.length}/1028</span>
                  </div>
                  <textarea
                    rows={5}
                    value={bodyMessage}
                    onChange={e => setBodyMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F3F3F3] text-sm text-[#1B1B1B] outline-none resize-none"
                    placeholder="Enter message content here..."
                  />
                  {/* Body Toolbar */}
                  <div className="flex items-center gap-4 mt-2 px-2 py-2 border-t border-[#E8E8E8] bg-[#F9F9F9]">
                    <div className="flex items-center gap-3">
                      <button className="text-[#1B1B1B]/40 hover:text-[#1B1B1B] text-xs font-bold">B</button>
                      <button className="text-[#1B1B1B]/40 hover:text-[#1B1B1B] text-xs italic font-serif">I</button>
                      <button className="text-[#1B1B1B]/40 hover:text-[#1B1B1B] text-xs line-through">S</button>
                    </div>
                    <div className="h-4 w-[1px] bg-[#E8E8E8]"></div>
                    <button onClick={addPlaceholder} className="flex items-center gap-1.5 text-[10px] font-bold text-[#25D366] uppercase hover:text-[#006D2F]">
                      <Plus size={12} /> Add variable
                    </button>
                  </div>
                </div>

                {/* Variable Samples Sub-section */}
                {Object.keys(variableSamples).length > 0 && (
                  <div className="bg-[#F3F3F3] p-6 space-y-4">
                    <h3 className="text-[10px] font-bold text-[#1B1B1B] uppercase tracking-widest">Variable Samples</h3>
                    <p className="text-[11px] text-[#1B1B1B]/50 leading-relaxed">Include samples of all variables in your message to help Meta review your template.</p>
                    {Object.entries(variableSamples).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-16 h-11 bg-white border border-[#E8E8E8] flex items-center justify-center text-[10px] font-bold text-[#1B1B1B]/30">{key}</div>
                        <input
                          type="text"
                          value={val}
                          onChange={e => updateVariableSample(key, e.target.value)}
                          className="flex-1 h-11 px-4 bg-white border border-[#E8E8E8] text-sm text-[#1B1B1B] outline-none"
                          placeholder="e.g. Jared"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase tracking-widest leading-none">Footer · Optional</label>
                    <span className="text-[10px] text-[#1B1B1B]/30 uppercase font-semibold">{footerText.length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={footerText}
                    onChange={e => setFooterText(e.target.value)}
                    className="w-full h-11 px-4 bg-[#F3F3F3] text-sm text-[#1B1B1B] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Buttons Section */}
            <div className="mb-10">
              <h2 className="text-xs font-bold text-[#1B1B1B] uppercase tracking-wider mb-2">Buttons · Optional</h2>
              <p className="text-xs text-[#1B1B1B]/50 mb-6 leading-relaxed">
                Create buttons that let customers respond to your message or take action. You can add up to 10 buttons.
              </p>

              <div className="space-y-4 mb-4">
                {buttons.map((btn, index) => (
                  <div key={btn.id} className="bg-white border border-[#E8E8E8] p-6 relative">
                    <button onClick={() => removeButton(btn.id)} className="absolute right-4 top-4 text-[#1B1B1B]/30 hover:text-red-500"><X size={16} /></button>
                    <h3 className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase mb-6 tracking-widest">Call to Action · {index + 1}</h3>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase mb-2 block tracking-widest">Type of Action</label>
                        <select 
                          value={btn.type} 
                          onChange={e => updateButton(btn.id, { type: e.target.value as ButtonType })}
                          className="w-full h-11 px-3 bg-[#F3F3F3] text-xs text-[#1B1B1B] outline-none appearance-none"
                        >
                          <option value="visit_website">Visit website</option>
                          <option value="call_phone_number">Call phone number</option>
                          <option value="copy_offer_code">Copy offer code</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase mb-2 block tracking-widest">Button Text</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={btn.text}
                            onChange={e => updateButton(btn.id, { text: e.target.value })}
                            className="w-full h-11 px-3 bg-[#F3F3F3] text-xs text-[#1B1B1B] outline-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#1B1B1B]/20 font-bold">{btn.text.length}/25</span>
                        </div>
                      </div>

                      {btn.type === 'visit_website' && (
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase mb-2 block tracking-widest">Website URL</label>
                          <input
                            type="text"
                            value={btn.url}
                            onChange={e => updateButton(btn.id, { url: e.target.value })}
                            className="w-full h-11 px-3 bg-[#F3F3F3] text-xs text-[#1B1B1B] outline-none"
                            placeholder="https://..."
                          />
                        </div>
                      )}

                      {btn.type === 'call_phone_number' && (
                        <>
                          <div>
                            <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase mb-2 block tracking-widest">Country</label>
                            <select 
                              value={btn.country} 
                              onChange={e => updateButton(btn.id, { country: e.target.value })}
                              className="w-full h-11 px-3 bg-[#F3F3F3] text-xs text-[#1B1B1B] outline-none appearance-none"
                            >
                              <option value="+1">US +1</option>
                              <option value="+91">IN +91</option>
                              <option value="+44">UK +44</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase mb-2 block tracking-widest">Phone number</label>
                            <input
                              type="text"
                              value={btn.phone}
                              onChange={e => updateButton(btn.id, { phone: e.target.value })}
                              className="w-full h-11 px-3 bg-[#F3F3F3] text-xs text-[#1B1B1B] outline-none"
                              placeholder="000-000-0000"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => addButton('visit_website')}
                className="flex items-center gap-2 h-11 px-6 bg-[#F3F3F3] text-[#1B1B1B] text-[10px] font-bold uppercase tracking-widest hover:bg-[#E8E8E8] transition-colors"
              >
                <Plus size={14} /> Add button
              </button>
            </div>

            {/* Form Footer Actions */}
            <div className="flex items-center gap-6 pt-10 border-t border-[#E8E8E8]">
              <button 
                className="h-14 px-10 text-white text-sm font-bold tracking-widest uppercase"
                style={{ background: 'linear-gradient(90deg, #006D2F, #25D366)' }}
              >
                Submit for review
              </button>
              <button className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest hover:text-[#1B1B1B]/50 transition-colors">Previous</button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Live Preview ───────────────────────────────────── */}
          <div className="bg-[#F9F9F9] flex flex-col items-center pt-8 pb-12 sticky top-0 h-screen overflow-y-auto">
            <div className="w-full px-8 mb-6">
              <p className="text-[10px] font-bold text-[#1B1B1B]/40 uppercase tracking-[0.2em]">Template preview</p>
            </div>

            {/* Interactive Phone Mockup */}
            <div className="w-[300px] bg-white border border-[#E8E8E8] relative flex flex-col min-h-[500px]">
              
              {/* WhatsApp Background Header Area */}
              <div 
                className="flex-1 bg-[#ECE5DD] p-4 flex flex-col justify-start overflow-y-auto"
                style={{ 
                  backgroundImage: 'radial-gradient(#1B1B1B10 1px, transparent 0)', 
                  backgroundSize: '15px 15px' 
                }}
              >
                {/* Bubble Container */}
                <div className="bg-white shadow-sm max-w-[90%] self-start relative flex flex-col">
                  {/* Header */}
                  {headerContent && (
                    <div className="bg-[#F0F0F0] px-3 py-3 border-b border-[#E8E8E8]">
                      <p className="text-[#1B1B1B] text-xs font-bold leading-tight">{headerContent}</p>
                    </div>
                  )}
                  {/* Body */}
                  <div className="px-3 py-3">
                    <p className="text-[#1B1B1B] text-xs leading-relaxed">
                      {renderPreviewBody()}
                    </p>
                  </div>
                  {/* Footer */}
                  {footerText && (
                    <div className="px-3 pb-1">
                      <p className="text-[#1B1B1B]/40 text-[9px] uppercase tracking-wider">{footerText}</p>
                    </div>
                  )}
                  {/* Timestamp */}
                  <div className="px-3 pb-2 flex justify-end">
                    <p className="text-[#1B1B1B]/20 text-[8px] font-bold">6:38 PM</p>
                  </div>
                </div>

                {/* Preview CTA Buttons sitting below the bubble */}
                <div className="mt-0.5 space-y-0.5 max-w-[90%] self-start w-full">
                  {buttons.map(btn => (
                    <div key={btn.id} className="bg-white shadow-sm flex items-center justify-center gap-2 py-2.5 cursor-not-allowed">
                      {btn.type === 'visit_website' && <ExternalLink size={14} className="text-[#0060FF]" />}
                      {btn.type === 'call_phone_number' && <Phone size={14} className="text-[#0060FF]" />}
                      {btn.type === 'copy_offer_code' && <Copy size={14} className="text-[#0060FF]" />}
                      <span className="text-[#0060FF] text-[11px] font-semibold">{btn.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Context Box (Meta Node Style) */}
            <div className="w-[300px] mt-6 bg-[#1B1B1B] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[#25D366] rounded-full"></div>
                <p className="text-[9px] font-bold text-white uppercase tracking-widest">System_Node: Active_Preview</p>
              </div>
              <div className="grid grid-cols-2 gap-y-4 mb-4">
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-[10px] font-bold text-white uppercase">Valid_Mapping</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Provider</p>
                  <p className="text-[10px] font-bold text-white uppercase">Meta_Cloud_v22</p>
                </div>
              </div>
              <p className="text-[9px] text-white/30 leading-relaxed border-t border-white/10 pt-4">
                *REAL-TIME_SYNC: PREVIEW DATA IS DERIVED DIRECTLY FROM FORM INPUTS. PRODUCTION VALUES WILL BE RENDERED VIA WHATSAPP CLOUD API.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

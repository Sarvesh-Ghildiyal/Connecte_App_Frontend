import { Database, Calendar, User, Smartphone } from 'lucide-react';
import type { Template } from '../Broadcast';

interface Step3Props {
  template: Template;
  variableMappings: Record<number, string>;
  onUpdateMappings: (m: Record<number, string>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Configuration({ template, variableMappings, onUpdateMappings, onNext, onBack }: Step3Props) {
  
  const handleMapVariable = (index: number, value: string) => {
    onUpdateMappings({ ...variableMappings, [index]: value });
  };

  // Helper to render message preview with variables highlighted
  const renderPreview = (text: string) => {
    let result = text;
    for (let i = 1; i <= template.variablesCount; i++) {
        const val = variableMappings[i] || `[Variable {{${i}}}]`;
        result = result.replace(`{{${i}}}`, `<span class="text-[#25D366] font-black">${val}</span>`);
    }
    return <p className="text-[13px] leading-relaxed text-[#1B1B1B]" dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-12 pb-32">
      {/* Left: Configuration Form */}
      <div className="flex-1 space-y-12">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#25D366] uppercase">STEP 03 / 04</p>
          <h1 className="text-[3.5rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">CONFIGURE PAYLOAD</h1>
          <div className="flex items-center gap-4">
             <span className="h-[2px] w-12 bg-[#25D366]" />
             <p className="text-[10px] font-black tracking-widest text-[#1B1B1B]/40 uppercase">Map your data variables precisely for delivery</p>
          </div>
        </div>

        <div className="space-y-10">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Variable Mapping</p>
          
          <div className="space-y-8">
            {Array.from({ length: template.variablesCount }).map((_, i) => {
               const index = i + 1;
               const currentMapping = variableMappings[index] || '';
               return (
                 <div key={index} className="space-y-3">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black tracking-widest text-[#1B1B1B]/40 uppercase">
                        Placeholder <span className="text-[#1B1B1B]">{`{{${index}}}`}</span> / {index === 1 ? 'Recipient Name' : index === 2 ? 'Offer Percentage' : 'Expiry Date'}
                      </p>
                      {currentMapping && <span className="text-[9px] font-black text-[#25D366] tracking-widest uppercase flex items-center gap-1">Mapped <Database size={10}/></span>}
                   </div>
                   <div className="relative group">
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentMapping ? 'bg-[#25D366]' : 'bg-[#E8E8E8]'}`} />
                     <input 
                        type="text"
                        value={currentMapping}
                        onChange={(e) => handleMapVariable(index, e.target.value)}
                        placeholder="Type static text or select dynamic field..."
                        className="w-full h-14 bg-[#F3F3F3] border-none outline-none px-6 text-[11px] font-black tracking-widest text-[#1B1B1B] uppercase placeholder:text-[#1B1B1B]/20"
                        list={`dynamic-fields-${index}`}
                     />
                     <datalist id={`dynamic-fields-${index}`}>
                       <option value="Contact Name" />
                       <option value="Phone Number" />
                       <option value="First Name" />
                       <option value="Last Order Date" />
                     </datalist>
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                        {index === 1 ? <User size={16}/> : index === 3 ? <Calendar size={16}/> : <Database size={16}/>}
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>

          <div className="space-y-6 pt-6">
            <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Media Header</p>
            <div className="p-8 border border-dashed border-[#E8E8E8] bg-white flex items-center gap-6">
               <div className="w-12 h-12 bg-[#F3F3F3] flex items-center justify-center">
                  <Database size={20} className="text-[#1B1B1B]/20" />
               </div>
               <div>
                  <p className="text-[11px] font-black text-[#1B1B1B] tracking-widest uppercase">campaign_banner_v2.jpg</p>
                  <p className="text-[9px] font-bold text-[#1B1B1B]/30 tracking-widest uppercase">Static Image Asset • 1.2MB</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-[450px] space-y-8">
         <p className="text-[11px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Live Message Preview</p>
         <div className="bg-white/50 border border-[#E8E8E8] p-12 flex items-center justify-center min-h-[600px] relative overflow-hidden group">
            {/* Phone Frame */}
            <div className="w-[300px] bg-white shadow-2xl relative z-10 border-[10px] border-[#1B1B1B] rounded-[40px] overflow-hidden aspect-[9/18]">
               {/* Status Bar */}
               <div className="h-6 bg-white px-6 flex justify-between items-center opacity-40">
                  <span className="text-[9px] font-bold">12:45</span>
                  <div className="flex gap-1.5 items-center">
                     <Database size={10} />
                     <User size={10} />
                  </div>
               </div>
               {/* WhatsApp Header */}
               <div className="h-14 bg-[#075E54] flex items-center px-4 gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                     <Smartphone size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-tight">Connecte Business</h4>
                    <p className="text-[8px] text-white/60 uppercase">Online</p>
                  </div>
               </div>
               {/* Chat Body */}
               <div className="flex-1 bg-[#E5DDD5] p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100%-100px)]">
                  {/* Message Bubble */}
                  <div className="bg-white p-4 shadow-sm relative self-start max-w-[90%]">
                     <div className="aspect-video bg-[#F3F3F3] mb-3 flex items-center justify-center">
                        <Database size={32} className="text-[#1B1B1B]/10" />
                     </div>
                     {renderPreview(template.bodyText)}
                     <div className="flex justify-end mt-2">
                        <span className="text-[8px] opacity-40 uppercase">12:45 PM</span>
                     </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button className="bg-white h-10 w-full text-[11px] font-bold text-[#34B7F1] uppercase shadow-sm">SHOP NOW</button>
                    <button className="bg-white h-10 w-full text-[11px] font-bold text-[#34B7F1] uppercase shadow-sm">UNSUBSCRIBE</button>
                  </div>
               </div>
            </div>
            {/* Background "Ghost" phone for depth */}
            <div className="absolute w-[300px] aspect-[9/18] bg-[#F3F3F3] rounded-[40px] rotate-6 scale-95 opacity-50 -z-0" />
         </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-[240px] right-0 h-24 bg-white border-t border-[#E8E8E8] px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-12">
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Selected Template</p>
             <p className="text-lg font-black text-[#1B1B1B] uppercase">{template.name.replace(/_/g, ' ')}</p>
          </div>
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Payload Integrity</p>
             <p className="text-lg font-black text-[#25D366] uppercase">98% VALID</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="h-12 px-12 border border-[#E8E8E8] text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase hover:bg-black hover:text-white hover:border-black transition-all">
            BACK
          </button>
          <button
            onClick={onNext}
            disabled={Object.keys(variableMappings).length < template.variablesCount}
            className="h-12 px-12 bg-[#1B1B1B] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#25D366] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            NEXT STEP: SCHEDULE
          </button>
        </div>
      </div>
    </div>
  );
}

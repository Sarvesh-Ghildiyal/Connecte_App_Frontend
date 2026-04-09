import { useMemo } from 'react';
import { Database, User, Smartphone, Type } from 'lucide-react';
import type { Template, TemplateParameterInput } from '@/types';

interface Step3Props {
  template: Template;
  parameters: TemplateParameterInput[];
  onUpdateParameters: (p: TemplateParameterInput[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Configuration({ template, parameters, onUpdateParameters, onNext, onBack }: Step3Props) {
  
  const bodyText = useMemo(() => {
    return template.components.find(c => c.type === 'BODY')?.text || '';
  }, [template]);

  // Extract all placeholders like {{1}} or {{first_name}}
  const placeholders = useMemo(() => {
    const matches = Array.from(bodyText.matchAll(/\{\{(.+?)\}\}/g));
    const unique = Array.from(new Set(matches.map(m => m[1])));
    
    return unique.map(key => {
      const isNumeric = /^\d+$/.test(key);
      return {
        key,
        isNumeric,
        index: isNumeric ? parseInt(key) : undefined,
        name: isNumeric ? undefined : key
      };
    });
  }, [bodyText]);

  const handleUpdateParam = (key: string, value: string) => {
    const placeholder = placeholders.find(p => p.key === key);
    if (!placeholder) return;

    let newParams = [...parameters];
    const existingIndex = newParams.findIndex(p => 
      placeholder.isNumeric ? (p.index === placeholder.index) : (p.name === placeholder.name)
    );

    const newParam: TemplateParameterInput = {
      type: 'text',
      value,
      ...(placeholder.isNumeric ? { index: placeholder.index } : { name: placeholder.name })
    };

    if (existingIndex >= 0) {
      newParams[existingIndex] = newParam;
    } else {
      newParams.push(newParam);
    }
    
    onUpdateParameters(newParams);
  };

  const renderPreview = (text: string) => {
    let result = text;
    placeholders.forEach(p => {
       const param = parameters.find(param => 
         p.isNumeric ? (param.index === p.index) : (param.name === p.name)
       );
       const val = param?.value || `{{${p.key}}}`;
       // Simple escape for HTML
       const displayVal = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
       result = result.replace(`{{${p.key}}}`, `<span class="text-[#25D366] font-black">${displayVal}</span>`);
    });
    return <p className="text-[13px] leading-relaxed text-[#1B1B1B]" dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const isComplete = placeholders.every(p => 
    parameters.some(param => 
      (p.isNumeric ? param.index === p.index : param.name === p.name) && param.value
    )
  );

  return (
    <div className="max-w-6xl mx-auto flex gap-12 pb-32">
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
            {placeholders.map((p) => {
               const param = parameters.find(param => 
                 p.isNumeric ? (param.index === p.index) : (param.name === p.name)
               );
               const currentValue = param?.value || '';
               return (
                 <div key={p.key} className="space-y-3">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black tracking-widest text-[#1B1B1B]/40 uppercase">
                        Placeholder <span className="text-[#1B1B1B]">{`{{${p.key}}}`}</span>
                      </p>
                      {currentValue && <span className="text-[9px] font-black text-[#25D366] tracking-widest uppercase flex items-center gap-1">Defined <Type size={10}/></span>}
                   </div>
                   <div className="relative group">
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentValue ? 'bg-[#25D366]' : 'bg-[#E8E8E8]'}`} />
                     <input 
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleUpdateParam(p.key, e.target.value)}
                        placeholder={`Value for ${p.key}...`}
                        className="w-full h-14 bg-[#F3F3F3] border-none outline-none px-6 text-[11px] font-black tracking-widest text-[#1B1B1B] uppercase placeholder:text-[#1B1B1B]/20"
                     />
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                        <Database size={16}/>
                     </div>
                   </div>
                 </div>
               );
            })}
            {placeholders.length === 0 && (
              <div className="p-8 bg-[#F3F3F3] text-center">
                <p className="text-[10px] font-black text-[#1B1B1B]/30 uppercase tracking-widest">No variables detected in this template.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[450px] space-y-8">
         <p className="text-[11px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Live Message Preview</p>
         <div className="bg-white/50 border border-[#E8E8E8] p-12 flex items-center justify-center min-h-[600px] relative overflow-hidden group">
            <div className="w-[300px] bg-white shadow-2xl relative z-10 border-[10px] border-[#1B1B1B] rounded-[40px] overflow-hidden aspect-[9/18]">
               <div className="h-6 bg-white px-6 flex justify-between items-center opacity-40">
                  <span className="text-[9px] font-bold">12:45</span>
                  <div className="flex gap-1.5 items-center">
                     <Database size={10} />
                     <User size={10} />
                  </div>
               </div>
               <div className="h-14 bg-[#075E54] flex items-center px-4 gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                     <Smartphone size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-tight">Connecte Business</h4>
                    <p className="text-[8px] text-white/60 uppercase">Online</p>
                  </div>
               </div>
               <div className="flex-1 bg-[#E5DDD5] p-4 flex flex-col gap-4 overflow-y-auto h-[calc(100%-100px)]">
                  <div className="bg-white p-4 shadow-sm relative self-start max-w-[90%]">
                     {renderPreview(bodyText)}
                     <div className="flex justify-end mt-2">
                        <span className="text-[8px] opacity-40 uppercase">12:45 PM</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute w-[300px] aspect-[9/18] bg-[#F3F3F3] rounded-[40px] rotate-6 scale-95 opacity-50 -z-0" />
         </div>
      </div>

      <div className="fixed bottom-0 left-[240px] right-0 h-24 bg-white border-t border-[#E8E8E8] px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-12">
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Selected Template</p>
             <p className="text-lg font-black text-[#1B1B1B] uppercase">{template.name.replace(/_/g, ' ')}</p>
          </div>
          <div className="space-y-1">
             <p className="text-[9px] font-black tracking-widest text-[#1B1B1B]/30 uppercase">Payload Integrity</p>
             <p className="text-lg font-black text-[#25D366] uppercase">{isComplete ? '100% VALID' : 'ACTION REQUIRED'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="h-12 px-12 border border-[#E8E8E8] text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase hover:bg-black hover:text-white hover:border-black transition-all">
            BACK
          </button>
          <button
            onClick={onNext}
            disabled={!isComplete}
            className="h-12 px-12 bg-[#1B1B1B] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-[#25D366] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            NEXT STEP: REVIEW
          </button>
        </div>
      </div>
    </div>
  );
}

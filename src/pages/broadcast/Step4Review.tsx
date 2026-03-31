import { useState } from 'react';
import { AlertTriangle, Terminal, CheckCircle2, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Template } from '../Broadcast';

interface Step4Props {
  template: Template;
  recipientCount: number;
  variableMappings: Record<number, string>;
  onBack: () => void;
  onLaunch: () => void;
}

export function Step4Review({ template, recipientCount, onBack, onLaunch }: Step4Props) {
  const [confirmAudience, setConfirmAudience] = useState(false);
  const [confirmIrreversible, setConfirmIrreversible] = useState(false);

  const isReady = confirmAudience && confirmIrreversible;

  // Dummy rate based on category
  const rate = template.category === 'MARKETING' ? 0.82 : template.category === 'UTILITY' ? 0.35 : 0.12;
  const totalCost = recipientCount * rate;

  return (
    <div className="max-w-6xl mx-auto flex gap-12 pb-32">
      {/* Left: Summary Content */}
      <div className="flex-1 space-y-12">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#25D366] uppercase">DEPLOYMENT SUMMARY</p>
          <h1 className="text-[3.5rem] font-black text-[#1B1B1B] leading-none tracking-tight uppercase">Review & <br/> Launch</h1>
        </div>

        <div className="space-y-12">
            <div className="space-y-6">
                <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Selected Template</p>
                <div className="p-10 bg-white border-l-8 border-[#1B1B1B] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#F3F3F3] flex items-center justify-center">
                            <Terminal size={24} className="text-[#1B1B1B]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#1B1B1B] uppercase tracking-tight">{template.name}</h3>
                            <p className="text-[10px] font-bold text-[#1B1B1B]/30 tracking-widest uppercase mt-1">Last updated: Today at 09:42 AM</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[#E8E8E8] border border-[#E8E8E8]">
                <div className="bg-white p-12 space-y-4">
                    <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Audience Size</p>
                    <p className="text-[4rem] font-black text-[#25D366] leading-none">{recipientCount.toLocaleString()}</p>
                    <p className="text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase">Verified Leads</p>
                </div>
                <div className="bg-white p-12 space-y-4">
                    <p className="text-[10px] font-black tracking-[0.2em] text-[#1B1B1B]/30 uppercase">Estimated Cost</p>
                    <p className="text-[4rem] font-black text-[#1B1B1B] leading-none">₹ {totalCost.toFixed(2)}</p>
                    <p className="text-[10px] font-black tracking-widest text-[#1B1B1B] uppercase">Meta API Rate</p>
                </div>
            </div>
        </div>
      </div>

      {/* Right: Confirmation Panel */}
      <div className="w-[480px]">
         <div className="bg-[#1B1B1B] text-white p-12 space-y-10 sticky top-10">
            <div className="flex items-center gap-4 text-[#25D366]">
                <AlertTriangle size={24} />
                <p className="text-[11px] font-black tracking-[0.2em] uppercase">Irreversible Action</p>
            </div>

            <h2 className="text-[3rem] font-black uppercase leading-tight">Proceed with Caution.</h2>
            
            <p className="text-sm text-white/40 leading-relaxed font-medium">
                Once you trigger this broadcast, messages will be queued and sent immediately through the Meta Cloud API. This process cannot be paused or cancelled once it has begun.
            </p>

            <div className="space-y-6 pt-6">
                <div 
                  className={`flex gap-4 cursor-pointer group transition-colors p-4 -mx-4 ${confirmAudience ? 'bg-white/5' : ''}`}
                  onClick={() => setConfirmAudience(!confirmAudience)}
                >
                    <div className="pt-1">
                        <Checkbox 
                          checked={confirmAudience} 
                          onCheckedChange={() => setConfirmAudience(!confirmAudience)}
                          className="border-white/20 data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366]" 
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black tracking-widest uppercase">Verify Audience</p>
                        <p className="text-[10px] text-white/30 font-medium leading-relaxed">
                            I confirm that the list of {recipientCount.toLocaleString()} contacts is correct and contains no duplicates.
                        </p>
                    </div>
                </div>

                <div 
                  className={`flex gap-4 cursor-pointer group transition-colors p-4 -mx-4 ${confirmIrreversible ? 'bg-white/5' : ''}`}
                  onClick={() => setConfirmIrreversible(!confirmIrreversible)}
                >
                    <div className="pt-1">
                        <Checkbox 
                          checked={confirmIrreversible} 
                          onCheckedChange={() => setConfirmIrreversible(!confirmIrreversible)}
                          className="border-white/20 data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366]" 
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black tracking-widest uppercase">Confirm Non-Cancellable</p>
                        <p className="text-[10px] text-white/30 font-medium leading-relaxed">
                            I understand that this action is final and all associated costs are non-refundable.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <button
                    onClick={onLaunch}
                    disabled={!isReady}
                    className="w-full h-16 bg-[#25D366] text-black text-xs font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-[#25D366] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    LAUNCH BROADCAST <CheckCircle2 size={18} />
                </button>
                <button 
                  onClick={onBack}
                  className="w-full text-center text-[10px] font-black tracking-[0.2em] text-white/30 hover:text-white uppercase py-4 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={14} /> Back to Configuration
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ImportSuccessModalProps {
  validRecords: number;
  duplicatesSkipped: number;
  refId: string;
  onViewDirectory: () => void;
  onImportAnother: () => void;
}

export default function ImportSuccessModal({
  validRecords,
  duplicatesSkipped,
  refId,
  onViewDirectory,
  onImportAnother,
}: ImportSuccessModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B1B1B]/20 backdrop-blur-[2px]"
        onClick={onViewDirectory}
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-white w-full max-w-[560px] mx-4 flex flex-col">
        {/* REF_ID top-right */}
        <span className="absolute top-4 right-5 text-[9px] font-bold text-[#1B1B1B]/20 tracking-widest uppercase">
          {refId}
        </span>

        {/* Close button */}
        <button
          onClick={onViewDirectory}
          className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center text-[#1B1B1B]/20 hover:text-[#1B1B1B] transition-colors"
        >
          <X size={15} />
        </button>

        {/* Body */}
        <div className="px-12 pt-16 pb-10 flex flex-col items-center text-center">
          {/* Icon block */}
          <div className="w-16 h-16 bg-[#F3F3F3] flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
              <Check size={20} className="text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Status label */}
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#1B1B1B]/40 uppercase mb-3">
            STATUS: OPERATION_COMPLETE
          </p>

          {/* Big headline */}
          <h1 className="text-[2.75rem] font-black text-[#1B1B1B] leading-none tracking-tight mb-6 uppercase">
            IMPORT_SUCCESS
          </h1>

          {/* Description */}
          <p className="text-sm text-[#1B1B1B]/50 leading-relaxed mb-10 max-w-xs">
            {validRecords.toLocaleString()} contacts have been successfully mapped and
            imported to your directory. All records are now indexed and
            available for broadcast operations.
          </p>

          {/* Stats row */}
          <div className="w-full grid grid-cols-2 border border-[#E8E8E8] mb-10">
            <div className="px-8 py-5 border-r border-[#E8E8E8]">
              <p className="text-[9px] font-bold tracking-[0.18em] text-[#1B1B1B]/30 uppercase mb-2">
                VALID_RECORDS
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {validRecords.toLocaleString()}
              </p>
            </div>
            <div className="px-8 py-5">
              <p className="text-[9px] font-bold tracking-[0.18em] text-[#1B1B1B]/30 uppercase mb-2">
                DUPLICATES_SKIPPED
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {duplicatesSkipped.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-0">
            <button
              id="view-directory-btn"
              onClick={onViewDirectory}
              className="h-14 text-white text-[11px] font-black tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #006D2F, #25D366)' }}
            >
              VIEW_DIRECTORY
            </button>
            <button
              id="import-another-btn"
              onClick={onImportAnother}
              className="h-14 bg-[#F3F3F3] text-[#1B1B1B]/50 text-[11px] font-black tracking-widest uppercase hover:bg-[#E8E8E8] transition-colors"
            >
              IMPORT_ANOTHER
            </button>
          </div>
        </div>

        {/* Green bottom accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#006D2F] to-[#25D366]" />
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="flex-1 overflow-auto bg-[#F9F9F9] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold text-[#0B0C10] leading-[48px] tracking-[-0.8px] uppercase">
            Platform Settings
          </h1>
          <p className="text-[14px] leading-[21px] text-[#6B7280] font-normal">
            Manage your account and platform preferences.
          </p>
        </div>

        <div className="bg-white p-8 border border-[#E8E8E8]">
          <h2 className="text-[14px] font-bold tracking-widest uppercase mb-4 text-[#1B1B1B]">
            Profile Overview
          </h2>
          <div className="h-40 flex items-center justify-center bg-[#F3F3F3] text-[#6B7280] text-sm">
            Profile settings module will be mounted here.
          </div>
        </div>
      </div>
    </div>
  );
}

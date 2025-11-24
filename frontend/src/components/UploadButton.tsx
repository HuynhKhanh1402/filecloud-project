import React from 'react';

const UploadButton: React.FC = () => {
  return (
    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
      <span className="truncate">Tải tệp lên</span>
    </button>
  );
};

export default UploadButton;

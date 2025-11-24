import React from 'react';
import MainLayout from '../layouts/MainLayout';

const Trash: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Trash</h1>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Items in trash will be deleted after 30 days</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-[#232f48] text-white text-sm font-medium rounded-lg border border-[#232f48] transition-colors">
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
            Empty Trash
          </button>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="size-24 rounded-full bg-[#1a2233] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[64px] text-gray-500">delete</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Trash is empty</h3>
          <p className="text-gray-400 text-center max-w-md">
            Items you delete will appear here. You can restore them within 30 days before they're permanently deleted.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Trash;

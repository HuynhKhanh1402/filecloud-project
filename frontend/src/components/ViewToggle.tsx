import React from 'react';

interface ViewToggleProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-[#1a2233] p-1 rounded-lg border border-gray-300 dark:border-[#232f48] transition-colors">
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-md transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-[#232f48] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <span className="material-symbols-outlined text-[20px]">view_list</span>
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-md transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white dark:bg-[#232f48] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
      >
        <span className="material-symbols-outlined text-[20px]">grid_view</span>
      </button>
    </div>
  );
};

export default ViewToggle;

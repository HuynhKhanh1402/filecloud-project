import React from 'react';

interface ViewToggleProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center bg-[#1a2233] p-1 rounded-lg border border-[#232f48]">
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded-md transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-[#232f48] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
      >
        <span className="material-symbols-outlined text-[20px]">view_list</span>
      </button>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-md transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-[#232f48] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
      >
        <span className="material-symbols-outlined text-[20px]">grid_view</span>
      </button>
    </div>
  );
};

export default ViewToggle;

import React from 'react';

export type FileType = 'all' | 'docs' | 'images' | 'videos' | 'audio';

interface FilterBarProps {
  viewToggle?: React.ReactNode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FileType;
  onFilterChange: (filter: FileType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  viewToggle, 
  searchQuery, 
  onSearchChange, 
  activeFilter, 
  onFilterChange 
}) => {
  const filters: { id: FileType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'docs', label: 'Documents' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
  ];

  return (
    <div className="px-4 py-3 flex flex-col gap-4">
      <label className="flex flex-col min-w-40 h-12 w-full">
        <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
          <div className="text-gray-400 dark:text-[#92a4c9] flex border border-r-0 border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#232f48] items-center justify-center pl-4 rounded-l-xl">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#232f48] h-full placeholder:text-gray-400 dark:placeholder:text-[#92a4c9] px-4 text-base font-normal leading-normal"
            placeholder="Search files by name..."
          />
        </div>
      </label>
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2 p-1 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-3 transition-colors ${activeFilter === filter.id
                ? 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-white'
                : 'bg-gray-100 dark:bg-[#232f48] text-gray-600 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-[#2d3a54]'
                }`}
            >
              <p className="text-sm font-medium leading-normal">{filter.label}</p>
            </button>
          ))}
        </div>
        {viewToggle && <div>{viewToggle}</div>}
      </div>
    </div>
  );
};

export default FilterBar;

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import FilterBar from '../components/FilterBar';
import ViewToggle from '../components/ViewToggle';

const MyFiles: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Files</h1>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Manage your files and folders</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            Upload
          </button>
        </div>

        <FilterBar viewToggle={<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />} />
        <FileTable viewMode={viewMode} />
      </div>
    </MainLayout>
  );
};

export default MyFiles;

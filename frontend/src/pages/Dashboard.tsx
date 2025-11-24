import React from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import ViewToggle from '../components/ViewToggle';

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Overview Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Overview</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-[#232f48] text-white text-sm font-medium rounded-lg border border-[#232f48] transition-colors">
                <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
                New Folder
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Storage Card */}
            <div className="p-6 bg-[#1a2233] rounded-xl border border-[#232f48]">
              <p className="text-gray-400 text-sm mb-1">Storage Used</p>
              <p className="text-2xl font-bold text-white mb-4">15.7 GB <span className="text-gray-500 text-lg font-normal">/ 50 GB</span></p>
              <div className="w-full bg-[#232f48] rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '31%' }}></div>
              </div>
            </div>

            {/* Total Files Card */}
            <div className="p-6 bg-[#1a2233] rounded-xl border border-[#232f48]">
              <p className="text-gray-400 text-sm mb-1">Total Files</p>
              <p className="text-2xl font-bold text-white">1,234</p>
            </div>

            {/* Total Folders Card */}
            <div className="p-6 bg-[#1a2233] rounded-xl border border-[#232f48]">
              <p className="text-gray-400 text-sm mb-1">Total Folders</p>
              <p className="text-2xl font-bold text-white">56</p>
            </div>
          </div>
        </div>

        {/* Recent Access Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Access</h3>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          <div className="bg-[#1a2233] rounded-xl border border-[#232f48] overflow-hidden">
            <FileTable viewMode={viewMode} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

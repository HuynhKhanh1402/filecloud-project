import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import { filesService } from '../services/files.service';
import type { FileItem } from '../services/dashboard.service';
import ViewToggle from '../components/ViewToggle';

const Trash: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const loadTrash = async () => {
    setLoading(true);
    try {
      const trashFiles = await filesService.getTrash();
      setFiles(trashFiles);
    } catch (error) {
      console.error('Failed to fetch trash files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all items in trash?')) return;

    // TODO: Implement empty trash API endpoint if available, 
    // or loop through files and delete them (less efficient)
    // For now, we'll just alert as it wasn't explicitly requested in the prompt
    alert('Empty trash functionality to be implemented');
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Trash</h1>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Items in trash will be deleted after 30 days</p>
          </div>
          {files.length > 0 && (
            <div className="flex items-center gap-4">
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <button
                onClick={handleEmptyTrash}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-[#232f48] text-white text-sm font-medium rounded-lg border border-[#232f48] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                Empty Trash
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading trash...</div>
        ) : files.length > 0 ? (
          <div className="bg-[#1a2233] rounded-xl border border-[#232f48] overflow-hidden">
            <FileTable viewMode={viewMode} files={files} onRefresh={loadTrash} isTrash={true} />
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="size-24 rounded-full bg-[#1a2233] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[64px] text-gray-500">delete</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trash is empty</h3>
            <p className="text-gray-400 text-center max-w-md">
              Items you delete will appear here. You can restore them within 30 days before they're permanently deleted.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Trash;

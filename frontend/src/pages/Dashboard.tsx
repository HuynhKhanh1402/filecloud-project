
import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import ViewToggle from '../components/ViewToggle';
import Modal from '../components/Modal';
import { dashboardService } from '../services/dashboard.service';
import { filesService } from '../services/files.service';
import type { UserStats, FileItem } from '../services/dashboard.service';
import { formatSize } from '../utils/format';
import { calculatePercentage } from '../utils/math';

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, filesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentFiles()
      ]);
      setStats(statsData);
      setRecentFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Pass current folder ID if we are inside a folder
      await filesService.uploadFile(file);

      // Refresh data
      await loadData();

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsProcessing(true);
    setErrorMessage('');
    try {
      await filesService.createFolder(newFolderName.trim());
      setCreateFolderModalOpen(false);
      setNewFolderName('');
      await loadData();
    } catch (error) {
      console.error('Failed to create folder:', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 409) {
        setErrorMessage('A folder with this name already exists in this location.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to create folder. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Overview Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview 1</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setCreateFolderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1a2233] hover:bg-gray-200 dark:hover:bg-[#232f48] text-gray-900 dark:text-white text-sm font-medium rounded-lg border border-gray-300 dark:border-[#232f48] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
                New Folder
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Storage Card */}
          <div className="p-6 bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-[#232f48] transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Storage Used</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {stats ? formatSize(stats.usedStorage) : '...'}
              <span className="text-gray-400 dark:text-gray-500 text-lg font-normal"> / {stats ? formatSize(stats.maxStorage) : '...'}</span>
            </p>
            <div className="w-full bg-gray-200 dark:bg-[#232f48] rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats ? calculatePercentage(stats.usedStorage, stats.maxStorage) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Total Files Card */}
          <div className="p-6 bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-[#232f48] transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Files</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats ? stats.totalFiles : '...'}</p>
          </div>

          {/* Total Folders Card */}
          <div className="p-6 bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-[#232f48] transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Folders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats ? stats.totalFolders : '...'}</p>
          </div>
        </div>


        {/* Recent Access Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Access</h3>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-[#232f48] overflow-hidden transition-colors">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading files...</div>
            ) : recentFiles.length > 0 ? (
              <FileTable viewMode={viewMode} files={recentFiles} onRefresh={loadData} />
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No recent files found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      <Modal
        isOpen={createFolderModalOpen}
        onClose={() => {
          setCreateFolderModalOpen(false);
          setNewFolderName('');
          setErrorMessage('');
        }}
        title="Create New Folder"
        footer={
          <>
            <button
              onClick={() => {
                setCreateFolderModalOpen(false);
                setNewFolderName('');
                setErrorMessage('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={isProcessing || !newFolderName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Creating...' : 'Create'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="text-sm text-gray-700 dark:text-gray-400">Folder name</label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value);
              setErrorMessage('');
            }}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-[#232f48] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary transition-colors"
            placeholder="Enter folder name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Dashboard;

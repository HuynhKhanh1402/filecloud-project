import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import FilterBar from '../components/FilterBar';
import ViewToggle from '../components/ViewToggle';
import Modal from '../components/Modal';
import { filesService, type FolderItem } from '../services/files.service';
import type { FileItem } from '../services/dashboard.service';
import FileIcon from '../components/FileIcon';
import { formatDate } from '../utils/format';

const MyFiles: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolderForAction, setSelectedFolderForAction] = useState<FolderItem | null>(null);
  const [activeFolderMenuId, setActiveFolderMenuId] = useState<string | null>(null);
  const [folderMenuPosition, setFolderMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Modals
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filesData, foldersData] = await Promise.all([
        filesService.getFiles(currentFolderId || undefined),
        filesService.getFolders(currentFolderId || undefined),
      ]);
      setFiles(filesData);
      setFolders(foldersData);

      // Load breadcrumb if we're in a folder
      if (currentFolderId) {
        const breadcrumbData = await filesService.getBreadcrumb(currentFolderId);
        setBreadcrumb(breadcrumbData);
      } else {
        setBreadcrumb([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFolderId]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        await filesService.uploadFile(selectedFiles[i], currentFolderId || undefined);
      }
      await loadData();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsProcessing(true);
    try {
      await filesService.createFolder(newFolderName.trim(), currentFolderId || undefined);
      setCreateFolderModalOpen(false);
      setNewFolderName('');
      await loadData();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const handleFolderMenuClick = (e: React.MouseEvent, folder: FolderItem) => {
    e.stopPropagation();
    if (activeFolderMenuId === folder.id) {
      setActiveFolderMenuId(null);
      setFolderMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 192; // w-48 = 12rem = 192px
      const menuHeight = 200; // estimated height
      
      // Calculate position to keep menu within viewport
      let top = rect.bottom + 2;
      let left = rect.right - menuWidth; // Align right edge of menu with right edge of button
      
      // Check if menu goes below viewport
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 2;
      }
      
      // Check if menu goes beyond left edge
      if (left < 8) {
        left = 8;
      }
      
      // Check if menu goes beyond right edge
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }
      
      setActiveFolderMenuId(folder.id);
      setFolderMenuPosition({ top, left });
    }
  };

  const openRenameFolderModal = (folder: FolderItem) => {
    setSelectedFolderForAction(folder);
    setNewFolderName(folder.name);
    setRenameFolderModalOpen(true);
    setActiveFolderMenuId(null);
    setFolderMenuPosition(null);
  };

  const handleRenameFolderSubmit = async () => {
    if (!selectedFolderForAction || !newFolderName.trim()) return;

    setIsProcessing(true);
    try {
      await filesService.renameFolder(selectedFolderForAction.id, newFolderName.trim());
      setRenameFolderModalOpen(false);
      setNewFolderName('');
      await loadData();
    } catch (error) {
      console.error('Failed to rename folder:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteFolderModal = (folder: FolderItem) => {
    setSelectedFolderForAction(folder);
    setDeleteFolderModalOpen(true);
    setActiveFolderMenuId(null);
    setFolderMenuPosition(null);
  };

  const handleDeleteFolderSubmit = async () => {
    if (!selectedFolderForAction) return;

    setIsProcessing(true);
    try {
      await filesService.deleteFolder(selectedFolderForAction.id);
      setDeleteFolderModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFolderMenu = (folder: FolderItem) => {
    if (!folderMenuPosition) return null;

    return (
      <div
        ref={folderMenuRef}
        className="fixed w-48 bg-[#1a2233] border border-[#232f48] rounded-xl shadow-lg z-[9999] overflow-hidden"
        style={{
          top: `${folderMenuPosition.top}px`,
          left: `${folderMenuPosition.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <button
            onClick={() => openRenameFolderModal(folder)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Rename
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
            Move
          </button>
          <div className="border-t border-[#232f48] my-1"></div>
          <button
            onClick={() => openDeleteFolderModal(folder)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[#232f48] hover:text-red-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            Delete
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderMenuRef.current && !folderMenuRef.current.contains(event.target as Node)) {
        setActiveFolderMenuId(null);
        setFolderMenuPosition(null);
      }
    };

    if (activeFolderMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFolderMenuId]);

  const activeFolder = folders.find(f => f.id === activeFolderMenuId);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Files</h1>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Manage your files and folders</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateFolderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-[#232f48] text-white text-sm font-medium rounded-lg transition-colors border border-[#232f48]"
            >
              <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
              New Folder
            </button>
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => handleBreadcrumbClick(null)}
              className="text-gray-500 dark:text-[#92a4c9] hover:text-primary dark:hover:text-primary transition-colors"
            >
              My Files
            </button>
            {breadcrumb.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className="text-gray-500 dark:text-[#92a4c9]">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(folder.id)}
                  className={`${
                    index === breadcrumb.length - 1
                      ? 'text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-500 dark:text-[#92a4c9] hover:text-primary dark:hover:text-primary'
                  } transition-colors`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        <FilterBar viewToggle={<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-4">Folders</h2>
                {viewMode === 'grid' ? (
                  <div className="px-4 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          onClick={() => handleFolderClick(folder.id)}
                          className="group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 bg-white dark:bg-[#1a2233] border-gray-200 dark:border-[#232f48] hover:border-primary/50 dark:hover:border-primary/50 flex flex-col items-center gap-3 text-center"
                        >
                          <span className="material-symbols-outlined text-[48px] text-primary">folder</span>
                          <div className="w-full">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{folder.name}</p>
                            <p className="text-xs text-gray-500 dark:text-[#92a4c9] mt-1">{formatDate(folder.createdAt)}</p>
                          </div>
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={(e) => handleFolderMenuClick(e, folder)}
                              className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d3a54] text-gray-400 transition-opacity ${activeFolderMenuId === folder.id ? 'opacity-100 bg-gray-100 dark:bg-[#2d3a54]' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-gray-200 dark:divide-[#232f48]">
                          {folders.map((folder) => (
                            <tr
                              key={folder.id}
                              onClick={() => handleFolderClick(folder.id)}
                              className="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-[#1a2233]"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <span className="material-symbols-outlined text-[32px] text-primary">folder</span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{folder.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-[#92a4c9] md:hidden">{formatDate(folder.createdAt)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-500 dark:text-[#92a4c9] hidden md:table-cell">{formatDate(folder.createdAt)}</td>
                              <td className="p-3 text-sm text-gray-500 dark:text-[#92a4c9] hidden sm:table-cell">—</td>
                              <td className="p-3 text-right relative">
                                <button
                                  onClick={(e) => handleFolderMenuClick(e, folder)}
                                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2d3a54] text-gray-500 dark:text-[#92a4c9] transition-colors ${activeFolderMenuId === folder.id ? 'bg-gray-200 dark:bg-[#2d3a54]' : ''}`}
                                >
                                  <span className="material-symbols-outlined text-lg">more_horiz</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Files Section */}
            {files.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-4">Files</h2>
                <FileTable viewMode={viewMode} files={files} onRefresh={loadData} />
              </div>
            )}

            {/* Empty State */}
            {folders.length === 0 && files.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-[80px] text-gray-300 dark:text-[#232f48] mb-4">folder_open</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No files or folders</h3>
                <p className="text-gray-500 dark:text-[#92a4c9] mb-6">Upload your first file or create a folder to get started</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCreateFolderModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-[#232f48] text-white text-sm font-medium rounded-lg transition-colors border border-[#232f48]"
                  >
                    <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
                    New Folder
                  </button>
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    Upload File
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Render folder menu outside the loop */}
      {activeFolder && renderFolderMenu(activeFolder)}

      {/* Create Folder Modal */}
      <Modal
        isOpen={createFolderModalOpen}
        onClose={() => {
          setCreateFolderModalOpen(false);
          setNewFolderName('');
        }}
        title="Create New Folder"
        footer={
          <>
            <button
              onClick={() => {
                setCreateFolderModalOpen(false);
                setNewFolderName('');
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
          <label className="text-sm text-gray-400">Folder name</label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f172a] border border-[#232f48] rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="Enter folder name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
        </div>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal
        isOpen={renameFolderModalOpen}
        onClose={() => {
          setRenameFolderModalOpen(false);
          setNewFolderName('');
        }}
        title="Rename Folder"
        footer={
          <>
            <button
              onClick={() => {
                setRenameFolderModalOpen(false);
                setNewFolderName('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameFolderSubmit}
              disabled={isProcessing || !newFolderName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Renaming...' : 'Rename'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="text-sm text-gray-400">Enter new name</label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f172a] border border-[#232f48] rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolderSubmit()}
          />
        </div>
      </Modal>

      {/* Delete Folder Modal */}
      <Modal
        isOpen={deleteFolderModalOpen}
        onClose={() => setDeleteFolderModalOpen(false)}
        title="Delete Folder"
        footer={
          <>
            <button
              onClick={() => setDeleteFolderModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFolderSubmit}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-gray-300">
          Are you sure you want to delete <span className="font-semibold text-white">"{selectedFolderForAction?.name}"</span>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          All files and subfolders inside will also be deleted. This action cannot be undone.
        </p>
      </Modal>
    </MainLayout>
  );
};

export default MyFiles;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import FilterBar, { type FileType } from '../components/FilterBar';
import ViewToggle from '../components/ViewToggle';
import Modal from '../components/Modal';
import { filesService, type FolderItem } from '../services/files.service';
import type { FileItem } from '../services/dashboard.service';
import { sharesService, type ShareResponse } from '../services/shares.service';
import { formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const MyFiles: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [shares, setShares] = useState<ShareResponse[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolderForAction, setSelectedFolderForAction] = useState<FolderItem | null>(null);
  const [activeFolderMenuId, setActiveFolderMenuId] = useState<string | null>(null);
  const [folderMenuPosition, setFolderMenuPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FileType>('all');

  // Modals
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [renameFolderModalOpen, setRenameFolderModalOpen] = useState(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);
  const [moveFolderModalOpen, setMoveFolderModalOpen] = useState(false);
  const [deleteShareModalOpen, setDeleteShareModalOpen] = useState(false);
  const [selectedShareForDelete, setSelectedShareForDelete] = useState<ShareResponse | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedDestinationFolderId, setSelectedDestinationFolderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [filesData, foldersData, sharesData] = await Promise.all([
        filesService.getFiles(currentFolderId || undefined),
        filesService.getFolders(currentFolderId || undefined),
        sharesService.getMyShares(),
      ]);
      setFiles(filesData);
      setFolders(foldersData);
      setShares(sharesData);

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
  }, [currentFolderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setErrorMessage('');
    try {
      await filesService.createFolder(newFolderName.trim(), currentFolderId || undefined);
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
    setErrorMessage('');
    try {
      await filesService.renameFolder(selectedFolderForAction.id, newFolderName.trim());
      setRenameFolderModalOpen(false);
      setNewFolderName('');
      await loadData();
    } catch (error) {
      console.error('Failed to rename folder:', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 409) {
        setErrorMessage('A folder with this name already exists in this location.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to rename folder. Please try again.');
      }
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

  const openMoveFolderModal = (folder: FolderItem) => {
    setSelectedFolderForAction(folder);
    setSelectedDestinationFolderId(null);
    setMoveFolderModalOpen(true);
    setActiveFolderMenuId(null);
    setFolderMenuPosition(null);
  };

  const handleMoveFolderSubmit = async () => {
    if (!selectedFolderForAction) return;

    setIsProcessing(true);
    try {
      await filesService.moveFolder(selectedFolderForAction.id, selectedDestinationFolderId);
      setMoveFolderModalOpen(false);
      setSelectedDestinationFolderId(null);
      await loadData();
    } catch (error) {
      console.error('Failed to move folder:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteShareSubmit = async () => {
    if (!selectedShareForDelete) return;

    setIsProcessing(true);
    try {
      await sharesService.deleteShare(selectedShareForDelete.id);
      toast.success('Share link deleted successfully');
      setDeleteShareModalOpen(false);
      setSelectedShareForDelete(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete share:', error);
      toast.error('Failed to delete share link');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter and search logic
  const getFileTypeCategory = (mimeType: string): FileType => {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
      mimeType.includes('document') ||
      mimeType.includes('pdf') ||
      mimeType.includes('text') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation')
    ) {
      return 'docs';
    }
    return 'all';
  };

  const filteredFiles = useMemo(() => {
    let result = files;

    // Apply type filter
    if (activeFilter !== 'all') {
      result = result.filter(file => getFileTypeCategory(file.mimeType) === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file => file.name.toLowerCase().includes(query));
    }

    return result;
  }, [files, activeFilter, searchQuery]);

  // Folders are not affected by search/filter
  const filteredFolders = folders;

  const renderFolderMenu = (folder: FolderItem) => {
    if (!folderMenuPosition) return null;

    return (
      <div
        ref={folderMenuRef}
        className="fixed w-48 bg-white dark:bg-[#1a2233] border border-gray-200 dark:border-[#232f48] rounded-xl shadow-lg z-[9999] overflow-hidden transition-colors"
        style={{
          top: `${folderMenuPosition.top}px`,
          left: `${folderMenuPosition.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <button
            onClick={() => openRenameFolderModal(folder)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232f48] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Rename
          </button>
          <button
            onClick={() => openMoveFolderModal(folder)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232f48] hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
            Move
          </button>
          <div className="border-t border-gray-200 dark:border-[#232f48] my-1"></div>
          <button
            onClick={() => openDeleteFolderModal(folder)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#232f48] hover:text-red-700 dark:hover:text-red-300 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1a2233] hover:bg-gray-200 dark:hover:bg-[#232f48] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors border border-gray-300 dark:border-[#232f48]"
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

        <FilterBar 
          viewToggle={<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Shares Section */}
            {shares.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-4">Shares</h2>
                <div className="bg-white dark:bg-[#1a2233] rounded-xl border border-gray-200 dark:border-[#232f48] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 dark:bg-[#0f172a]">
                        <tr>
                          <th className="p-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">File</th>
                          <th className="p-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Created</th>
                          <th className="p-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Status</th>
                          <th className="p-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-[#232f48]">
                        {shares.map((share) => (
                          <tr key={share.id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[24px] text-primary">link</span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                    {share.file?.name || 'Unknown file'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                                    {new Date(share.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                              {new Date(share.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 hidden md:table-cell">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                share.isActive 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                {share.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(share.shareUrl);
                                      toast.success('Link copied!');
                                    } catch (_err) {
                                      toast.error('Failed to copy link');
                                    }
                                  }}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                                  title="Copy link"
                                >
                                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                </button>
                                <button
                                  onClick={() => window.open(share.shareUrl, '_blank')}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                                  title="Open link"
                                >
                                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedShareForDelete(share);
                                    setDeleteShareModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                                  title="Delete share"
                                >
                                  <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-4">Folders</h2>
                {viewMode === 'grid' ? (
                    <div className="px-4 py-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredFolders.map((folder) => (
                          <div
                            key={folder.id}
                            onClick={() => handleFolderClick(folder.id)}
                            className="group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 bg-white dark:bg-[#1a2233] border-gray-200 dark:border-[#232f48] hover:border-primary/50 flex flex-col items-center gap-3 text-center"
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
                            {filteredFolders.map((folder) => (
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
            {filteredFiles.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-4">Files</h2>
                <FileTable 
                  viewMode={viewMode} 
                  files={filteredFiles} 
                  onRefresh={loadData}
                  folders={folders}
                  currentFolderId={currentFolderId}
                />
              </div>
            )}

            {/* Empty State */}
            {folders.length === 0 && filteredFiles.length === 0 && shares.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-[80px] text-gray-300 dark:text-[#232f48] mb-4">
                  {searchQuery || activeFilter !== 'all' ? 'search_off' : 'folder_open'}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery || activeFilter !== 'all' ? 'No files found' : 'No files or folders'}
                </h3>
                <p className="text-gray-500 dark:text-[#92a4c9] mb-6">
                  {searchQuery || activeFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first file or create a folder to get started'
                  }
                </p>
                {!searchQuery && activeFilter === 'all' && (
                  <div className="flex gap-3">
                  <button
                    onClick={() => setCreateFolderModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2233] hover:bg-gray-50 dark:hover:bg-[#232f48] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-[#232f48]"
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
                )}
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

      {/* Rename Folder Modal */}
      <Modal
        isOpen={renameFolderModalOpen}
        onClose={() => {
          setRenameFolderModalOpen(false);
          setNewFolderName('');
          setErrorMessage('');
        }}
        title="Rename Folder"
        footer={
          <>
            <button
              onClick={() => {
                setRenameFolderModalOpen(false);
                setNewFolderName('');
                setErrorMessage('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors"
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
          <label className="text-sm text-gray-700 dark:text-gray-400">Enter new name</label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => {
              setNewFolderName(e.target.value);
              setErrorMessage('');
            }}
            className="w-full px-4 py-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#232f48] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolderSubmit()}
          />
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
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
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors"
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
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{selectedFolderForAction?.name}"</span>?
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-500 mt-2">
          All files and subfolders inside will also be deleted. This action cannot be undone.
        </p>
      </Modal>

      {/* Move Folder Modal */}
      <Modal
        isOpen={moveFolderModalOpen}
        onClose={() => {
          setMoveFolderModalOpen(false);
          setSelectedDestinationFolderId(null);
        }}
        title="Move Folder"
        footer={
          <>
            <button
              onClick={() => {
                setMoveFolderModalOpen(false);
                setSelectedDestinationFolderId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMoveFolderSubmit}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Moving...' : 'Move'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Move <span className="font-semibold text-gray-900 dark:text-white">"{selectedFolderForAction?.name}"</span> to:
          </p>
          
          {/* Root folder option - only show if not already in root */}
          {currentFolderId && (
            <button
              onClick={() => setSelectedDestinationFolderId(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                selectedDestinationFolderId === null
                  ? 'bg-primary/20 border-primary text-white'
                  : 'bg-gray-50 dark:bg-[#0f172a] border-gray-200 dark:border-[#232f48] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f172a]/80'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-gray-700 dark:text-primary">home</span>
              <span className="font-medium">Root (My Files)</span>
            </button>
          )}

          {/* Folder list - exclude current folder being moved */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {folders
              .filter(f => f.id !== selectedFolderForAction?.id)
              .map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedDestinationFolderId(folder.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                    selectedDestinationFolderId === folder.id
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-gray-50 dark:bg-[#0f172a] border-gray-200 dark:border-[#232f48] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0f172a]/80'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px] text-primary">folder</span>
                  <span className="font-medium">{folder.name}</span>
                </button>
              ))
            }
          </div>

          {folders.filter(f => f.id !== selectedFolderForAction?.id).length === 0 && !currentFolderId && (
            <p className="text-sm text-gray-600 dark:text-gray-500 text-center py-4">
              No other folders available. Create a new folder first.
            </p>
          )}
          
          {folders.filter(f => f.id !== selectedFolderForAction?.id).length === 0 && currentFolderId && (
            <p className="text-sm text-gray-600 dark:text-gray-500 text-center py-4">
              No other folders available in this location.
            </p>
          )}
        </div>
      </Modal>

      {/* Delete Share Link Modal */}
      <Modal
        isOpen={deleteShareModalOpen}
        onClose={() => {
          setDeleteShareModalOpen(false);
          setSelectedShareForDelete(null);
        }}
        title="Delete Share Link"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteShareModalOpen(false);
                setSelectedShareForDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteShareSubmit}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[24px] mt-0.5">warning</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Anyone with this link will no longer be able to access the file.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-[#232f48]">
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[24px]">link</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedShareForDelete?.file?.name || 'Unknown file'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Created on {selectedShareForDelete ? new Date(selectedShareForDelete.createdAt).toLocaleDateString() : ''}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this share link?
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default MyFiles;

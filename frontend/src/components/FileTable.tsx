import React, { useState, useRef, useEffect } from 'react';
import { filesService } from '../services/files.service';
import type { FileItem } from '../services/dashboard.service';
import Modal from './Modal';
import { formatSize, formatDate } from '../utils/format';
import FileIcon from './FileIcon';

export interface FileTableProps {
  viewMode: 'list' | 'grid';
  files: FileItem[];
  onRefresh?: () => void;
  isTrash?: boolean;
}

const FileTable: React.FC<FileTableProps> = ({ viewMode, files, onRefresh, isTrash = false }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Modal States
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFileForAction, setSelectedFileForAction] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (id: string) => {
    setSelectedFiles((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 192; // w-48 = 12rem = 192px
      const menuHeight = isTrash ? 150 : 280; // estimated heights

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

      setActiveMenuId(id);
      setMenuPosition({ top, left });
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      await filesService.downloadFile(file.id, file.name);
      setActiveMenuId(null);
      setMenuPosition(null);
    } catch (error) {
      console.error('Download failed:', error);
      // Ideally use a toast here
    }
  };

  const openRenameModal = (file: FileItem) => {
    setSelectedFileForAction(file);
    setNewName(file.name);
    setRenameModalOpen(true);
    setActiveMenuId(null);
    setMenuPosition(null);
  };

  const handleRenameSubmit = async () => {
    if (!selectedFileForAction || !newName || newName === selectedFileForAction.name) {
      setRenameModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      await filesService.renameFile(selectedFileForAction.id, newName);
      if (onRefresh) onRefresh();
      setRenameModalOpen(false);
    } catch (error) {
      console.error('Rename failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteModal = (file: FileItem) => {
    setSelectedFileForAction(file);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
    setMenuPosition(null);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedFileForAction) return;

    setIsProcessing(true);
    try {
      if (isTrash) {
        await filesService.deleteFilePermanently(selectedFileForAction.id);
      } else {
        await filesService.moveToTrash(selectedFileForAction.id);
      }
      if (onRefresh) onRefresh();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (file: FileItem) => {
    try {
      await filesService.restoreFile(file.id);
      if (onRefresh) onRefresh();
      setActiveMenuId(null);
      setMenuPosition(null);
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const renderMenu = (file: FileItem) => {
    if (!menuPosition) return null;

    return (
      <div
        ref={menuRef}
        className="fixed w-48 bg-[#1a2233] border border-[#232f48] rounded-xl shadow-lg z-[9999] overflow-hidden"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          {isTrash ? (
            <>
              <button
                onClick={() => handleRestore(file)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">restore_from_trash</span>
                Restore
              </button>
              <div className="border-t border-[#232f48] my-1"></div>
              <button
                onClick={() => openDeleteModal(file)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[#232f48] hover:text-red-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                Delete Permanently
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleDownload(file)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download
              </button>
              <button
                onClick={() => openRenameModal(file)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Rename
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
                Move
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">share</span>
                Share
              </button>
              <div className="border-t border-[#232f48] my-1"></div>
              <button
                onClick={() => openDeleteModal(file)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[#232f48] hover:text-red-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
        setMenuPosition(null);
      }
    };

    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const activeFile = files.find(f => f.id === activeMenuId);

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="mt-4 px-4 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleSelection(file.id)}
                className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 text-center ${selectedFiles.has(file.id)
                  ? 'bg-primary/10 border-primary/50 dark:bg-primary/20'
                  : 'bg-white dark:bg-[#1a2233] border-gray-200 dark:border-[#232f48] hover:border-primary/50 dark:hover:border-primary/50'
                  }`}
              >
                <FileIcon mimeType={file.mimeType} />
                <div className="w-full">
                  <p className={`text-sm font-semibold truncate ${selectedFiles.has(file.id) ? 'text-primary dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[#92a4c9] mt-1">{formatSize(file.size)} • {formatDate(file.createdAt)}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => handleMenuClick(e, file.id)}
                    className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d3a54] text-gray-400 transition-opacity ${activeMenuId === file.id ? 'opacity-100 bg-gray-100 dark:bg-[#2d3a54]' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 px-4 py-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-gray-200 dark:border-[#232f48]">
                <tr>
                  <th className="p-3 text-xs font-semibold uppercase text-gray-500 dark:text-[#92a4c9]">Name</th>
                  <th className="p-3 text-xs font-semibold uppercase text-gray-500 dark:text-[#92a4c9] hidden md:table-cell">Date Uploaded</th>
                  <th className="p-3 text-xs font-semibold uppercase text-gray-500 dark:text-[#92a4c9] hidden sm:table-cell">Size</th>
                  <th className="p-3 text-xs font-semibold uppercase text-gray-500 dark:text-[#92a4c9]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#232f48]">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => toggleSelection(file.id)}
                    className={`cursor-pointer transition-colors duration-200 ${selectedFiles.has(file.id) ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-[#1a2233]'}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <FileIcon mimeType={file.mimeType} />
                        <div>
                          <p className={`text-sm font-semibold ${selectedFiles.has(file.id) ? 'text-primary dark:text-white' : 'text-gray-900 dark:text-white'}`}>{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-[#92a4c9] md:hidden">{formatDate(file.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500 dark:text-[#92a4c9] hidden md:table-cell">{formatDate(file.createdAt)}</td>
                    <td className="p-3 text-sm text-gray-500 dark:text-[#92a4c9] hidden sm:table-cell">{formatSize(file.size)}</td>
                    <td className="p-3 text-right relative">
                      <button
                        onClick={(e) => handleMenuClick(e, file.id)}
                        className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2d3a54] text-gray-500 dark:text-[#92a4c9] transition-colors ${activeMenuId === file.id ? 'bg-gray-200 dark:bg-[#2d3a54]' : ''}`}
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

      {/* Render menu outside the loop */}
      {activeFile && renderMenu(activeFile)}

      {/* Rename Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Rename File"
        footer={
          <>
            <button
              onClick={() => setRenameModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRenameSubmit}
              disabled={isProcessing || !newName.trim()}
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
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f172a] border border-[#232f48] rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            placeholder="File name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={isTrash ? "Delete Permanently" : "Move to Trash"}
        footer={
          <>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#232f48] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-gray-300">
          {isTrash
            ? <>Are you sure you want to <span className="font-bold text-red-500">permanently delete</span> <span className="font-semibold text-white">"{selectedFileForAction?.name}"</span>? This action cannot be undone.</>
            : <>Are you sure you want to move <span className="font-semibold text-white">"{selectedFileForAction?.name}"</span> to trash?</>
          }
        </p>
        {!isTrash && (
          <p className="text-sm text-gray-500 mt-2">
            You can restore it later from the Trash folder.
          </p>
        )}
      </Modal>
    </>
  );
};

export default FileTable;

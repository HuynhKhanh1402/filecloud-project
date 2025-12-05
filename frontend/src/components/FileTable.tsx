import React, { useState, useRef, useEffect } from 'react';
import { filesService } from '../services/files.service';
import type { FileItem } from '../services/dashboard.service';

export interface FileTableProps {
  viewMode: 'list' | 'grid';
  files: FileItem[];
  onRefresh?: () => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB');
};

const getIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary"><span className="material-symbols-outlined">description</span></div>;
  } else if (mimeType.includes('image')) {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-green-500/10 text-green-500"><span className="material-symbols-outlined">image</span></div>;
  } else if (mimeType.includes('video')) {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-orange-500/10 text-orange-500"><span className="material-symbols-outlined">videocam</span></div>;
  } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/10 text-purple-500"><span className="material-symbols-outlined">archive</span></div>;
  } else if (mimeType.includes('folder')) {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-yellow-500/10 text-yellow-500"><span className="material-symbols-outlined">folder</span></div>;
  } else if (mimeType.includes('text')) {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-blue-500/10 text-blue-500"><span className="material-symbols-outlined">article</span></div>;
  }
  return <div className="flex items-center justify-center size-10 rounded-lg bg-gray-500/10 text-gray-500"><span className="material-symbols-outlined">insert_drive_file</span></div>;
};

const FileTable: React.FC<FileTableProps> = ({ viewMode, files, onRefresh }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
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
      setActiveMenuId(id);
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      await filesService.downloadFile(file.id, file.name);
      setActiveMenuId(null);
      setMenuPosition(null);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleRename = async (file: FileItem) => {
    const newName = window.prompt('Enter new name:', file.name);
    if (newName && newName !== file.name) {
      try {
        await filesService.renameFile(file.id, newName);
        setActiveMenuId(null);
        setMenuPosition(null);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Rename failed:', error);
        alert('Failed to rename file');
      }
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await filesService.moveToTrash(file.id);
        setActiveMenuId(null);
        setMenuPosition(null);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete file');
      }
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
          right: `${menuPosition.right}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <button
            onClick={() => handleDownload(file)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#232f48] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Download
          </button>
          <button
            onClick={() => handleRename(file)}
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
            onClick={() => handleDelete(file)}
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

  if (viewMode === 'grid') {
    return (
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
              {getIcon(file.mimeType)}
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
                {activeMenuId === file.id && renderMenu(file)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
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
                    {getIcon(file.mimeType)}
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
                  {activeMenuId === file.id && renderMenu(file)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable;

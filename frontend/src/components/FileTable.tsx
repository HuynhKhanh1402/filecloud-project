import React from 'react';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  isFolder: boolean;
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
    return <div className="flex items-center justify-center size-10 rounded-lg bg-purple-500/10 text-purple-500"><span className="material-symbols-outlined">folder_zip</span></div>;
  } else {
    return <div className="flex items-center justify-center size-10 rounded-lg bg-gray-500/10 text-gray-500"><span className="material-symbols-outlined">draft</span></div>;
  }
};

interface FileTableProps {
  viewMode: 'list' | 'grid';
  files: FileItem[];
}

const FileTable: React.FC<FileTableProps> = ({ viewMode, files }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFiles(newSelection);
  };

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
              <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d3a54] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-lg">more_vert</span>
              </button>
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
                <td className="p-3 text-right">
                  <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2d3a54] text-gray-500 dark:text-[#92a4c9] transition-colors">
                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                  </button>
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

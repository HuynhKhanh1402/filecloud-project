import React from 'react';

interface FileIconProps {
  mimeType: string;
}

const FileIcon: React.FC<FileIconProps> = ({ mimeType }) => {
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

export default FileIcon;

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';

const Shared: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Shared with me</p>
          <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Files shared with you</p>
        </div>
        <FileTable viewMode="list" />
      </div>
    </MainLayout>
  );
};

export default Shared;

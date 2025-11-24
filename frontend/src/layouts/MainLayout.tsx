import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#101622] font-display">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

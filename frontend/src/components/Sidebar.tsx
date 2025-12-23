import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { userService, type UserStats } from '../services/user.service';
import { formatSize } from '../utils/format';
import { calculatePercentage } from '../utils/math';

const Sidebar: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await userService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  const storagePercentage = stats ? calculatePercentage(stats.usedStorage, stats.maxStorage) : 0;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-[#101622] border-r border-gray-200 dark:border-[#232f48] fixed left-0 top-0 z-50 transition-colors">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-6 py-5 hover:opacity-80 transition-opacity w-fit">
        <div className="size-10 flex items-center justify-center rounded-xl bg-primary text-white">
          <span className="material-symbols-outlined text-[28px]">cloud</span>
        </div>
        <h1 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">FileCloud</h1>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1">
        <NavLink
          to="/"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          Dashboard
        </NavLink>
        <NavLink
          to="/files"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">folder</span>
          My Files
        </NavLink>
        <NavLink
          to="/shared"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          Shared with me
        </NavLink>
        <NavLink
          to="/trash"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
          Trash
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Settings
        </NavLink>
      </nav>

      {/* Storage Widget */}
      <div className="p-4 m-3 mb-8 bg-gradient-to-br from-blue-50 to-white dark:from-[#1a2233] dark:to-[#1a2233] rounded-xl border border-blue-100 dark:border-[#232f48] shadow-sm dark:shadow-none transition-colors">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-900 dark:text-white">Storage</span>
          <span className="text-xs font-semibold text-primary">{storagePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-[#232f48] rounded-full h-2 mb-2 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all" style={{ width: `${storagePercentage}%` }}></div>
        </div>
        <p className="text-[10px] text-gray-600 dark:text-gray-400">
          {stats ? `${formatSize(stats.usedStorage)} of ${formatSize(stats.maxStorage)} used` : 'Loading...'}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

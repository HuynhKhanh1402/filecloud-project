import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileIcon from '../components/FileIcon';
import { sharesService } from '../services/shares.service';
import { ShareNotificationModal } from '../components/ShareNotificationModal';
import { formatSize, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

type TabType = 'accepted' | 'pending';

const Shared: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('accepted');
  const [acceptedShares, setAcceptedShares] = useState<any[]>([]);
  const [pendingShares, setPendingShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadShares();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadShares = async () => {
    try {
      setLoading(true);
      if (activeTab === 'accepted') {
        const shares = await sharesService.getReceivedShares();
        setAcceptedShares(shares);
      } else {
        const shares = await sharesService.getPendingShares();
        setPendingShares(shares);
      }
    } catch (error) {
      console.error('Failed to load shares:', error);
      toast.error('Failed to load shares');
    } finally {
      setLoading(false);
    }
  };

  const handleShareAction = () => {
    setSelectedShare(null);
    loadShares();
  };

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 192;
      const menuHeight = 60;

      let top = rect.bottom + 2;
      let left = rect.right - menuWidth;

      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 2;
      }

      if (left < 8) {
        left = 8;
      }

      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      setActiveMenuId(id);
      setMenuPosition({ top, left });
    }
  };

  const handleDownload = async (share: any) => {
    try {
      await sharesService.downloadSharedFile(share.id, share.file.name);
      toast.success('Download started');
      setActiveMenuId(null);
      setMenuPosition(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Download failed');
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Shared with me</p>
          <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Files shared with you</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'accepted'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Accepted Files
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 relative ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Pending Requests
            {pendingShares.length > 0 && (
              <span className="absolute top-2 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {pendingShares.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : activeTab === 'accepted' ? (
          <>
            {acceptedShares.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No accepted shared files</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#0f172a] border-b border-gray-200 dark:border-[#232f48]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shared By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#1a2233] divide-y divide-gray-200 dark:divide-[#232f48]">
                    {acceptedShares.map((share: any) => (
                      <tr key={share.id} className="hover:bg-gray-50 dark:hover:bg-[#0f172a] transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <FileIcon fileName={share.file.name} mimeType={share.file.mimeType} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{share.file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <div className="font-medium">{share.owner?.fullName || 'Unknown'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{share.owner?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatSize(share.file.size)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDate(share.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm relative">
                          <button
                            onClick={(e) => handleMenuClick(e, share.id)}
                            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2d3a54] text-gray-500 dark:text-[#92a4c9] transition-colors ${activeMenuId === share.id ? 'bg-gray-200 dark:bg-[#2d3a54]' : ''}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Context Menu */}
            {activeMenuId && menuPosition && (
              <div
                ref={menuRef}
                className="fixed w-48 bg-white dark:bg-[#1a2233] border border-gray-200 dark:border-[#232f48] rounded-xl shadow-lg z-[9999] overflow-hidden"
                style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
              >
                <button
                  onClick={() => {
                    const share = acceptedShares.find(s => s.id === activeMenuId);
                    if (share) handleDownload(share);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232f48] hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingShares.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No pending share requests</p>
              </div>
            ) : (
              pendingShares.map((share: any) => (
                <div
                  key={share.id}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedShare(share)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {share.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        From: {share.owner.fullName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {share.owner.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded">
                          Pending
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(share.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Share Action Modal */}
      {selectedShare && (
        <ShareNotificationModal
          shareId={selectedShare.id}
          fileName={selectedShare.file.name}
          ownerName={selectedShare.owner.fullName}
          ownerEmail={selectedShare.owner.email}
          onClose={() => setSelectedShare(null)}
          onAction={handleShareAction}
        />
      )}
    </MainLayout>
  );
};

export default Shared;

import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileTable from '../components/FileTable';
import { sharesService } from '../services/shares.service';
import { ShareNotificationModal } from '../components/ShareNotificationModal';
import toast from 'react-hot-toast';

type TabType = 'accepted' | 'pending';

const Shared: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('accepted');
  const [acceptedFiles, setAcceptedFiles] = useState<any[]>([]);
  const [pendingShares, setPendingShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState<any>(null);

  useEffect(() => {
    loadShares();
  }, [activeTab]);

  const loadShares = async () => {
    try {
      setLoading(true);
      if (activeTab === 'accepted') {
        const shares = await sharesService.getReceivedShares();
        const sharedFiles = shares.map((share: any) => ({
          ...share.file,
          sharedBy: share.owner,
          shareId: share.id,
        }));
        setAcceptedFiles(sharedFiles);
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
          <FileTable viewMode="list" files={acceptedFiles} />
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

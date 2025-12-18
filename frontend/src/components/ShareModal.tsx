import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { sharesService, type ShareResponse } from '../services/shares.service';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, fileId, fileName }) => {
  const [share, setShare] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && fileId) {
      loadOrCreateShare();
    }
  }, [isOpen, fileId]);

  const loadOrCreateShare = async () => {
    setLoading(true);
    try {
      const shareData = await sharesService.createShare(fileId);
      setShare(shareData);
    } catch (error) {
      console.error('Failed to create share:', error);
      toast.error('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!share) return;

    try {
      await navigator.clipboard.writeText(share.shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteShare = async () => {
    if (!share) return;

    try {
      await sharesService.deleteShare(share.id);
      toast.success('Share link deleted');
      onClose();
    } catch (error) {
      toast.error('Failed to delete share');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share File"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#232f48] rounded-lg transition-colors"
          >
            Close
          </button>
          {share && (
            <button
              onClick={handleDeleteShare}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Delete Link
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0f172a] rounded-lg">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Anyone with the link can view and download</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : share ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={share.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-[#232f48] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">info</span>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Created on {new Date(share.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Failed to load share link</p>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;

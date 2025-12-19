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

type TabType = 'public' | 'direct';

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, fileId, fileName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('public');
  const [share, setShare] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Direct share state
  const [email, setEmail] = useState('');
  const [sharingWithUser, setSharingWithUser] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('public');
      setEmail('');
      setShare(null);
    }
  }, [isOpen]);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const shareData = await sharesService.createShare(fileId);
      setShare(shareData);
      toast.success('Share link created!');
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

  const handleOpenLink = () => {
    if (!share) return;
    window.open(share.shareUrl, '_blank');
  };

  const handleShareWithUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSharingWithUser(true);
    try {
      await sharesService.createDirectShare(fileId, email.trim());
      toast.success('File shared successfully! Notification sent.');
      setEmail('');
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to share file';
      toast.error(message);
    } finally {
      setSharingWithUser(false);
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
          {activeTab === 'public' && share && (
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
        {/* File Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0f172a] rounded-lg">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'public'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Public Link
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'direct'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Share with User
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'public' ? (
          // Public Link Tab
          <>
            {share ? (
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
                    <button
                      onClick={handleOpenLink}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#2a3f5f] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Open
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">info</span>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Anyone with the link can view and download this file
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="text-center">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-[48px]">link</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No public link created yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Generate a link to share this file with anyone</p>
                </div>
                <button
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_link</span>
                      Generate Public Link
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          // Direct Share Tab
          <form onSubmit={handleShareWithUser} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user's email address"
                className="px-3 py-2 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-[#232f48] rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={sharingWithUser}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] mt-0.5">info</span>
              <div className="flex-1">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  The user will receive a real-time notification and can accept or reject the share request.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={sharingWithUser || !email.trim()}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sharingWithUser ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Send Share Request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;

import React, { useState } from 'react';
import { X, File, Check, XCircle } from 'lucide-react';
import { api } from '../services/auth.service';
import toast from 'react-hot-toast';

interface ShareNotificationModalProps {
  shareId: string;
  fileName: string;
  ownerName: string;
  ownerEmail: string;
  onClose: () => void;
  onAction: () => void;
}

export const ShareNotificationModal: React.FC<ShareNotificationModalProps> = ({
  shareId,
  fileName,
  ownerName,
  ownerEmail,
  onClose,
  onAction,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'accept' | 'reject') => {
    setLoading(true);
    try {
      await api.patch(
        `/shares/${shareId}/action`,
        { action }
      );
      toast.success(action === 'accept' ? 'Share accepted!' : 'Share rejected');
      onAction();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} share`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            New File Shared With You
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Owner Info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                {ownerName}
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                ({ownerEmail})
              </span>
            </div>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
              wants to share a file with you
            </p>
          </div>

          {/* File Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
              <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {fileName}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
          <button
            onClick={() => handleAction('accept')}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Accept'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

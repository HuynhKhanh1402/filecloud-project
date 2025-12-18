import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sharesService, type ShareResponse } from '../services/shares.service';
import { toast } from 'react-hot-toast';
import FileIcon from '../components/FileIcon';
import { formatSize } from '../utils/format';

function SharedFile() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [share, setShare] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShare = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sharesService.getShareByToken(token!);
      setShare(data);
    } catch (err) {
      console.error('Failed to load share:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Share not found or has been deactivated');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    loadShare();
  }, [token, loadShare]);

  const handleDownload = async () => {
    if (!token || !share) return;

    try {
      setDownloading(true);
      const downloadUrl = await sharesService.getDownloadUrl(token);
      
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
      toast.success('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400" style={{ fontSize: '32px' }}>error</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Share Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This share link is invalid or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '20px' }}>lock</span>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              FileCloud Share
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* File Icon and Name */}
          <div className="flex items-start gap-6 mb-8">
            <div className="flex-shrink-0" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
              <FileIcon mimeType={share.file?.mimeType || 'application/octet-stream'} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                {share.file?.name || 'Unknown file'}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{formatSize(share.file?.size || 0)}</span>
                <span>•</span>
                <span>Shared on {new Date(share.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownload}
              disabled={downloading || !share.isActive}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
              {downloading ? 'Preparing download...' : 'Download File'}
            </button>
          </div>

          {!share.isActive && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                This share link has been deactivated and is no longer available for download.
              </p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              About this file
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Type:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {share.file?.mimeType || 'Unknown'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Size:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {formatSize(share.file?.size || 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Shared:</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {new Date(share.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Want to share your files securely?
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
            >
              Sign in to FileCloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedFile;

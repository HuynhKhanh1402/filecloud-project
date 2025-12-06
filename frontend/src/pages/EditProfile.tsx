import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import Modal from '../components/Modal';
import { userService, type UserProfile } from '../services/user.service';
import { toast } from 'react-hot-toast';

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFullName(data.fullName || '');
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await userService.updateProfile({ fullName });
      setProfile(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const toastId = toast.loading('Uploading avatar...');
    try {
      const updatedUser = await userService.uploadAvatar(file);
      setProfile(updatedUser);
      toast.success('Avatar updated successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload avatar', { id: toastId });
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAvatar();
      await fetchProfile();
      toast.success('Avatar removed successfully');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Edit Profile</h1>
          <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Update your personal information</p>
        </div>

        <div className="max-w-3xl">
          <div className="bg-[#1a2233] rounded-xl border border-[#232f48] p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-[#232f48]">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="size-24 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <AvatarPlaceholder size="lg" />
                )}
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Change Avatar
                  </button>
                  {profile?.avatar && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/30"
                    >
                      Remove Avatar
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 bg-[#232f48] border border-[#2d3a54] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full p-3 bg-[#232f48] border border-[#2d3a54] rounded-lg text-gray-400 cursor-not-allowed opacity-75 focus:outline-none"
                  title="Email cannot be changed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#232f48]">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Delete Avatar Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Remove Avatar"
          footer={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#232f48] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAvatar}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <span className="material-symbols-outlined text-red-400 text-[24px]">warning</span>
              <p className="text-sm text-gray-300">
                Are you sure you want to remove your avatar? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default EditProfile;

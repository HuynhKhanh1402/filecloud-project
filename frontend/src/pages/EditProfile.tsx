import React from 'react';
import MainLayout from '../layouts/MainLayout';
import AvatarPlaceholder from '../components/AvatarPlaceholder';

const EditProfile: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Edit Profile</h1>
          <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">Update your personal information</p>
        </div>

        <div className="max-w-3xl">
          <div className="bg-[#1a2233] rounded-xl border border-[#232f48] p-6">
            <form className="flex flex-col gap-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-[#232f48]">
                <AvatarPlaceholder size="lg" />
                <div className="flex flex-col gap-2">
                  <button type="button" className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
                    Change Avatar
                  </button>
                  <button type="button" className="px-4 py-2 bg-[#232f48] hover:bg-[#2d3a54] text-white text-sm font-medium rounded-lg transition-colors">
                    Remove Avatar
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full p-3 bg-[#232f48] border border-[#2d3a54] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <input
                    type="text"
                    defaultValue="johndoe"
                    className="w-full p-3 bg-[#232f48] border border-[#2d3a54] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full p-3 bg-[#232f48] border border-[#2d3a54] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#232f48]">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-[#232f48] hover:bg-[#2d3a54] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProfile;

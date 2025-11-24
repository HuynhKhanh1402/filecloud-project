import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen w-full font-display">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="size-20 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white mb-8">
            <span className="material-symbols-outlined text-[48px]">cloud_upload</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to FileCloud</h1>
          <p className="text-white/80 text-lg max-w-md">Your secure and reliable cloud storage platform. Store and access files anytime, anywhere.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-[#101622] flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <div className="size-8 flex items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-[20px]">cloud</span>
              </div>
              <h1 className="text-white text-xl font-bold tracking-tight">FileCloud</h1>
            </div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

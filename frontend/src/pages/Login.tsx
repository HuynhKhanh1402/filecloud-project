import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';

const Login: React.FC = () => {
  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back! Please enter your details."
    >
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Email / Username</label>
          <input
            type="text"
            className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Enter your email or username"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Enter your password"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <span className="material-symbols-outlined text-[20px]">visibility_off</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="size-4 rounded border-gray-600 bg-[#1a2233] text-primary focus:ring-primary/50" />
            <span className="text-sm text-gray-400">Remember me</span>
          </label>
          <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">Forgot password?</a>
        </div>

        <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors mt-2">
          Login
        </button>
      </form>

      <div className="relative flex items-center gap-4 my-2">
        <div className="h-px bg-[#232f48] flex-1"></div>
        <span className="text-sm text-gray-500">or</span>
        <div className="h-px bg-[#232f48] flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white hover:bg-[#232f48] transition-colors">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="size-5" alt="Google" />
          <span className="text-sm font-medium">Google</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white hover:bg-[#232f48] transition-colors">
          <img src="https://www.svgrepo.com/show/452263/microsoft.svg" className="size-5" alt="Microsoft" />
          <span className="text-sm font-medium">Microsoft</span>
        </button>
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">
        Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register now</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;

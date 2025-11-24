import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';

const Register: React.FC = () => {
  return (
    <AuthLayout
      title="Register"
      subtitle="Create a new account to start storing your files."
    >
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Full Name</label>
          <input
            type="text"
            className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Enter your full name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Enter email address"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Create password"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Confirm Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Re-enter password"
            />
          </div>
        </div>

        <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors mt-2">
          Register
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-4">
        Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;

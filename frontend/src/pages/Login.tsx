import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { authService } from '../services/auth.service';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back! Please enter your details."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Email / Username</label>
          <input
            type="text"
            className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full p-3 bg-[#1a2233] border border-[#232f48] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>



      <p className="text-center text-sm text-gray-400 mt-4">
        Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register now</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;


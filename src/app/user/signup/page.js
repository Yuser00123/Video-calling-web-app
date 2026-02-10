'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiUser,
  FiLock,
  FiMail,
  FiArrowRight,
  FiVideo,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function UserSignup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email.trim() || !username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (username.trim().toLowerCase() === 'yashvardhan') {
      toast.error('This username is reserved');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), username.trim(), password);
      toast.success('Account created successfully!');
      router.push('/user/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message === 'Username already taken') {
        toast.error('Username already taken');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      {loading && <LoadingSpinner message="Creating account..." />}

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FiVideo className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold gradient-text">MeetFlow</span>
        </motion.div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
            <p className="text-gray-400 text-center mb-8">Join MeetFlow today</p>
          </motion.div>

          <form onSubmit={handleSignup} className="space-y-4">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field pl-12"
                  autoComplete="email"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="input-field pl-12"
                  autoComplete="username"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input-field pl-12 pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="input-field pl-12"
                  autoComplete="new-password"
                />
              </div>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              <span>Create Account</span>
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                href="/user/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-center"
          >
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
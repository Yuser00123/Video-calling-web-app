'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiVideo, FiUser, FiShield, FiArrowRight, FiZap, FiLock, FiUsers } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [user, userData, loading, router]);

  const features = [
    { icon: FiZap, title: 'Real-time Video', desc: 'Crystal clear HD video calls' },
    { icon: FiLock, title: 'Secure Rooms', desc: 'Private room codes for meetings' },
    { icon: FiUsers, title: 'Multi-User', desc: 'Multiple participants support' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25"
          >
            <FiVideo className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold gradient-text">MeetFlow</h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg md:text-xl text-center max-w-md mb-12"
        >
          Connect, collaborate, and communicate with crystal clear video calls
        </motion.p>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row gap-6 mb-16">
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/user/login')}
            className="group relative overflow-hidden glass-strong rounded-2xl p-8 w-72 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <FiUser className="w-7 h-7 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join as User</h2>
              <p className="text-gray-400 mb-4">Join meetings with a room code</p>
              <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                <span className="font-semibold">Get Started</span>
                <FiArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/login')}
            className="group relative overflow-hidden glass-strong rounded-2xl p-8 w-72 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <FiShield className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
              <p className="text-gray-400 mb-4">Create and manage meetings</p>
              <div className="flex items-center gap-2 text-purple-400 group-hover:gap-3 transition-all">
                <span className="font-semibold">Login</span>
                <FiArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Features */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center gap-3 text-gray-400"
            >
              <feature.icon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white text-sm font-semibold">{feature.title}</p>
                <p className="text-xs">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
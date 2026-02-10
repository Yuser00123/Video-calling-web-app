'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiHash, FiArrowRight, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UserDashboard() {
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/user/login');
    }
    if (!loading && userData?.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [user, userData, loading, router]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setJoining(true);
    try {
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to join room');
      setJoining(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-full max-w-lg"
        >
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Hello, <span className="gradient-text">{userData?.username}</span>! 👋
            </h1>
            <p className="text-gray-400 text-lg">Ready to join a meeting?</p>
          </motion.div>

          {/* Join Room Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="glass-strong rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FiVideo className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Join Meeting</h2>
                <p className="text-gray-400 text-sm">Enter the room code from your admin</p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="relative">
                <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code (e.g., ABC123)"
                  className="input-field pl-12 text-lg font-mono tracking-wider uppercase"
                  maxLength={10}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={joining || !roomCode.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                {joining ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join Room</span>
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Ask your admin for the room code to join the meeting.
                Your microphone will be on and camera will be off by default.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
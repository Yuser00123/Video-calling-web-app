'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createRoom } from '@/lib/firebase';
import { FiPlus, FiCopy, FiArrowRight, FiShield, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AdminDashboard() {
  const [roomCode, setRoomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
    if (!loading && userData && userData.role !== 'admin') {
      router.push('/user/dashboard');
    }
  }, [user, userData, loading, router]);

  const handleCreateMeeting = async () => {
    setCreating(true);
    try {
      const code = generateRoomCode();
      await createRoom(code, user.uid, userData.username);
      setRoomCode(code);
      toast.success('Meeting room created!');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create meeting');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinMeeting = () => {
    router.push(`/room/${roomCode}`);
  };

  if (loading) return <LoadingSpinner message="Loading..." />;
  if (!user || userData?.role !== 'admin') return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
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
            <div className="flex items-center justify-center gap-2 mb-3">
              <FiShield className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{userData?.username}</span>
            </h1>
            <p className="text-gray-400 text-lg">Create and manage your meetings</p>
          </motion.div>

          {/* Create Meeting Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="glass-strong rounded-3xl p-8"
          >
            {!roomCode ? (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-4"
                  >
                    <FiPlus className="w-10 h-10 text-yellow-400" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">Create New Meeting</h2>
                  <p className="text-gray-400 mt-1">Generate a room code for participants</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateMeeting}
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center justify-center gap-2 text-lg"
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-6 h-6" />
                      <span>Create Meeting</span>
                    </>
                  )}
                </motion.button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <FiCheck className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">Meeting Created!</h2>
                  <p className="text-gray-400 mt-1">Share this code with participants</p>
                </div>

                {/* Room Code Display */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="bg-dark-400/50 rounded-2xl p-6 text-center mb-6"
                >
                  <p className="text-gray-400 text-sm mb-2">Room Code</p>
                  <p className="text-4xl font-bold font-mono tracking-[0.3em] text-white animate-glow p-2">
                    {roomCode}
                  </p>
                </motion.div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyCode}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      copied
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-5 h-5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinMeeting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    <span>Join Meeting</span>
                    <FiArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setRoomCode('')}
                  className="w-full mt-4 text-gray-400 hover:text-gray-300 text-sm py-2 transition-colors"
                >
                  Create another meeting
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
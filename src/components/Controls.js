'use client';

import { motion } from 'framer-motion';
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiUsers,
  FiStopCircle,
} from 'react-icons/fi';

export default function Controls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onLeave,
  onEndMeeting,
  isAdmin = false,
  participantCount = 0,
  onToggleParticipants,
  showParticipants = false,
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
      className="fixed bottom-0 left-0 right-0 p-4 z-30"
    >
      <div className="max-w-xl mx-auto glass-strong rounded-2xl p-4 flex items-center justify-center gap-3">
        {/* Mic Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          className={`p-4 rounded-xl transition-all duration-300 ${
            isMuted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <FiMicOff className="w-6 h-6" /> : <FiMic className="w-6 h-6" />}
        </motion.button>

        {/* Camera Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleCamera}
          className={`p-4 rounded-xl transition-all duration-300 ${
            isCameraOff
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isCameraOff ? (
            <FiVideoOff className="w-6 h-6" />
          ) : (
            <FiVideo className="w-6 h-6" />
          )}
        </motion.button>

        {/* Participants Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleParticipants}
          className={`p-4 rounded-xl transition-all duration-300 relative ${
            showParticipants
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <FiUsers className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
            {participantCount}
          </span>
        </motion.button>

        {/* Leave Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLeave}
          className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300"
        >
          <FiPhoneOff className="w-6 h-6" />
        </motion.button>

        {/* End Meeting (Admin Only) */}
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEndMeeting}
            className="p-4 bg-red-700 hover:bg-red-800 text-white rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <FiStopCircle className="w-6 h-6" />
            <span className="hidden sm:inline text-sm font-semibold">End All</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMic, FiMicOff, FiVideoOff, FiShield, FiUserX, FiVolume2 } from 'react-icons/fi';

export default function ParticipantsList({
  participants,
  isOpen,
  onClose,
  isAdmin,
  onRemoveParticipant,
  onForceUnmute,
  currentUserId,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 glass-strong z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                Participants ({participants.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence>
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          participant.role === 'admin'
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}
                      >
                        {participant.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">
                            {participant.username}
                          </span>
                          {participant.id === currentUserId && (
                            <span className="text-xs text-gray-400">(You)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {participant.role === 'admin' && (
                            <span className="flex items-center gap-1 text-yellow-400 text-xs">
                              <FiShield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Status icons */}
                      {participant.isMuted ? (
                        <FiMicOff className="w-4 h-4 text-red-400" />
                      ) : (
                        <FiMic className="w-4 h-4 text-green-400" />
                      )}
                      {participant.isCameraOff && (
                        <FiVideoOff className="w-4 h-4 text-red-400" />
                      )}

                      {/* Admin controls for this participant */}
                      {isAdmin && participant.id !== currentUserId && participant.role !== 'admin' && (
                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {participant.isMuted && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onForceUnmute(participant.id)}
                              className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                              title="Force unmute"
                            >
                              <FiVolume2 className="w-3 h-3" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemoveParticipant(participant.id)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                            title="Remove user"
                          >
                            <FiUserX className="w-3 h-3" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiVideoOff, FiShield, FiX, FiVolume2 } from 'react-icons/fi';

export default function VideoTile({
  stream,
  username,
  isAdmin = false,
  isMuted = false,
  isCameraOff = true,
  isLocal = false,
  isBig = false,
  onRemove,
  onForceUnmute,
  showAdminControls = false,
}) {
  const videoRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Audio level detection for speaking indicator
  useEffect(() => {
    if (!stream || isMuted) {
      setSpeaking(false);
      return;
    }

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 512;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setSpeaking(average > 15);
      };

      const interval = setInterval(checkAudio, 200);

      return () => {
        clearInterval(interval);
        audioContext.close();
      };
    } catch (e) {
      // Audio context not supported
    }
  }, [stream, isMuted]);

  const initials = username
    ? username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={`video-tile relative rounded-2xl overflow-hidden ${
        isBig ? 'col-span-2 row-span-2' : ''
      } ${
        speaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-dark-500' : ''
      } ${isLocal ? 'ring-1 ring-blue-500/30' : ''}`}
      style={{ aspectRatio: isBig ? '16/9' : '4/3' }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
      />

      {/* Camera Off Placeholder */}
      {isCameraOff && (
        <div className="w-full h-full bg-gradient-to-br from-dark-200 to-dark-400 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`${
              isBig ? 'w-24 h-24 text-3xl' : 'w-16 h-16 text-xl'
            } rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg`}
          >
            {initials}
          </motion.div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Username & Status */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-full">
              <FiShield className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">Admin</span>
            </span>
          )}
          <span className="text-white text-sm font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {username} {isLocal && '(You)'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isMuted ? (
            <span className="p-1 bg-red-500/80 rounded-full">
              <FiMicOff className="w-3 h-3 text-white" />
            </span>
          ) : (
            speaking && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="p-1 bg-green-500/80 rounded-full"
              >
                <FiVolume2 className="w-3 h-3 text-white" />
              </motion.span>
            )
          )}
          {isCameraOff && (
            <span className="p-1 bg-red-500/80 rounded-full">
              <FiVideoOff className="w-3 h-3 text-white" />
            </span>
          )}
        </div>
      </div>

      {/* Admin Controls (only visible to admin for other users) */}
      {showAdminControls && !isLocal && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
          {isMuted && onForceUnmute && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onForceUnmute()}
              className="p-2 bg-yellow-500/80 rounded-lg text-white hover:bg-yellow-500 transition-colors"
              title="Force unmute"
            >
              <FiMic className="w-4 h-4" />
            </motion.button>
          )}
          {onRemove && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove()}
              className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-colors"
              title="Remove user"
            >
              <FiX className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
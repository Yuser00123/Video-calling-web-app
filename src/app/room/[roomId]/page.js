'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaStream } from '@/hooks/useMediaStream';
import peerService from '@/lib/peerService';
import {
  joinRoom,
  updateParticipantPeerId,
  updateParticipantMedia,
  subscribeToRoom,
  subscribeToParticipants,
  leaveRoom,
  removeParticipant,
  endRoom,
  forceUnmuteParticipant,
} from '@/lib/firebase';
import VideoTile from '@/components/VideoTile';
import Controls from '@/components/Controls';
import ParticipantsList from '@/components/ParticipantsList';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId;
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const { localStream, isMuted, isCameraOff, getStream, toggleMute, toggleCamera, forceUnmute, stopStream, setIsMuted } = useMediaStream();

  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [roomData, setRoomData] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [kicked, setKicked] = useState(false);

  const connectedPeers = useRef(new Set());
  const isInitialized = useRef(false);
  const unsubRoomRef = useRef(null);
  const unsubParticipantsRef = useRef(null);

  // Initialize room connection
  const initializeRoom = useCallback(async () => {
    if (!user || !userData || isInitialized.current) return;
    isInitialized.current = true;

    try {
      setIsConnecting(true);

      // 1. Get media stream (mic on, camera off by default)
      const stream = await getStream(false, true);

      // 2. Join room in Firestore
      await joinRoom(roomId, user.uid, userData.username);

      // 3. Initialize PeerJS
      const peerId = await peerService.initialize(user.uid);
      peerService.setLocalStream(stream);

      // 4. Update peer ID in Firestore
      await updateParticipantPeerId(roomId, user.uid, peerId);

      // 5. Set up remote stream handler
      peerService.onRemoteStream = (remotePeerId, remoteStream) => {
        console.log('Received remote stream from:', remotePeerId);
        setRemoteStreams((prev) => ({
          ...prev,
          [remotePeerId]: remoteStream,
        }));
      };

      peerService.onPeerDisconnect = (remotePeerId) => {
        console.log('Peer disconnected:', remotePeerId);
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[remotePeerId];
          return next;
        });
        connectedPeers.current.delete(remotePeerId);
      };

      // 6. Subscribe to room changes
      unsubRoomRef.current = subscribeToRoom(roomId, (room) => {
        setRoomData(room);
        if (room && !room.active) {
          toast.error('This meeting has been ended by the admin');
          handleLeave();
        }
      });

      // 7. Subscribe to participants
      unsubParticipantsRef.current = subscribeToParticipants(roomId, (parts) => {
        setParticipants(parts);

        // Check if current user was removed (kicked)
        const me = parts.find((p) => p.id === user.uid);
        if (!me && !kicked) {
          setKicked(true);
          toast.error('You have been removed from the meeting');
          handleLeave();
          return;
        }

        // Check for forced unmute
        if (me && me.forcedUnmute) {
          forceUnmute();
          toast('Admin has unmuted your microphone', { icon: '🎤' });
          // Reset the flag
          updateParticipantMedia(roomId, user.uid, { forcedUnmute: false });
        }

        // Connect to new peers
        parts.forEach((participant) => {
          if (
            participant.id !== user.uid &&
            participant.peerId &&
            !connectedPeers.current.has(participant.peerId)
          ) {
            connectedPeers.current.add(participant.peerId);
            console.log('Calling peer:', participant.peerId);
            peerService.callPeer(participant.peerId).catch((err) => {
              console.error('Failed to call peer:', err);
              connectedPeers.current.delete(participant.peerId);
            });
          }
        });

        // Clean up disconnected peers
        const activeIds = new Set(parts.map((p) => p.peerId).filter(Boolean));
        connectedPeers.current.forEach((peerId) => {
          if (!activeIds.has(peerId)) {
            peerService.closeCall(peerId);
            connectedPeers.current.delete(peerId);
            setRemoteStreams((prev) => {
              const next = { ...prev };
              delete next[peerId];
              return next;
            });
          }
        });
      });

      setIsConnecting(false);
    } catch (err) {
      console.error('Failed to initialize room:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [user, userData, roomId, getStream, forceUnmute, kicked]);

  useEffect(() => {
    if (!authLoading && user && userData) {
      initializeRoom();
    }
  }, [authLoading, user, userData, initializeRoom]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/user/login');
    }
  }, [authLoading, user, router]);

  // Update media state in Firestore
  useEffect(() => {
    if (user && roomId) {
      updateParticipantMedia(roomId, user.uid, {
        isMuted,
        isCameraOff,
      }).catch(console.error);
    }
  }, [isMuted, isCameraOff, user, roomId]);

  // Replace stream when camera toggles
  const handleToggleCamera = async () => {
    const newStream = await toggleCamera();
    if (newStream) {
      peerService.replaceStream(newStream);
    }
  };

  // Clean up on leave
  const handleLeave = useCallback(async () => {
    try {
      if (unsubRoomRef.current) unsubRoomRef.current();
      if (unsubParticipantsRef.current) unsubParticipantsRef.current();
      
      if (user && roomId) {
        await leaveRoom(roomId, user.uid).catch(() => {});
      }
      
      peerService.destroy();
      stopStream();
      
      if (userData?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err) {
      console.error('Error leaving room:', err);
      router.push('/');
    }
  }, [user, roomId, userData, router, stopStream]);

  // End meeting (admin only)
  const handleEndMeeting = async () => {
    if (!userData?.role === 'admin') return;
    
    const confirmed = window.confirm('Are you sure you want to end the meeting for everyone?');
    if (!confirmed) return;

    try {
      await endRoom(roomId);
      toast.success('Meeting ended for all participants');
      handleLeave();
    } catch (err) {
      console.error('Error ending meeting:', err);
      toast.error('Failed to end meeting');
    }
  };

  // Remove participant (admin only)
  const handleRemoveParticipant = async (participantId) => {
    const confirmed = window.confirm('Remove this participant from the meeting?');
    if (!confirmed) return;

    try {
      await removeParticipant(roomId, participantId);
      peerService.closeCall(participantId);
      toast.success('Participant removed');
    } catch (err) {
      toast.error('Failed to remove participant');
    }
  };

  // Force unmute (admin only)
  const handleForceUnmute = async (participantId) => {
    try {
      await forceUnmuteParticipant(roomId, participantId);
      toast.success('Unmute request sent');
    } catch (err) {
      toast.error('Failed to unmute participant');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubRoomRef.current) unsubRoomRef.current();
      if (unsubParticipantsRef.current) unsubParticipantsRef.current();
      peerService.destroy();
    };
  }, []);

  // Handle browser close/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && roomId) {
        leaveRoom(roomId, user.uid).catch(() => {});
      }
      peerService.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, roomId]);

  if (authLoading || isConnecting) {
    return <LoadingSpinner message="Connecting to meeting..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-3xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push(userData?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
            className="btn-primary"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Sort participants: admin first
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    return 0;
  });

  const isAdmin = userData?.role === 'admin';

  return (
    <div className="h-screen flex flex-col bg-dark-500 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-4 py-3 glass-strong z-20"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white font-semibold">Room: {roomId}</span>
          <span className="text-gray-400 text-sm">•</span>
          <span className="text-gray-400 text-sm">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
        </div>
        {isAdmin && (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-400 text-sm font-semibold">
            <span>⚡</span> Admin
          </span>
        )}
      </motion.div>

      {/* Video Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <div
          className={`grid gap-4 h-full ${
            participants.length <= 1
              ? 'grid-cols-1'
              : participants.length <= 2
              ? 'grid-cols-1 md:grid-cols-2'
              : participants.length <= 4
              ? 'grid-cols-2'
              : participants.length <= 6
              ? 'grid-cols-2 md:grid-cols-3'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          <AnimatePresence>
            {sortedParticipants.map((participant) => {
              const isCurrentUser = participant.id === user?.uid;
              const isParticipantAdmin = participant.role === 'admin';
              const stream = isCurrentUser
                ? localStream
                : remoteStreams[participant.peerId] || remoteStreams[participant.id];

              return (
                <VideoTile
                  key={participant.id}
                  stream={stream}
                  username={participant.username}
                  isAdmin={isParticipantAdmin}
                  isMuted={isCurrentUser ? isMuted : participant.isMuted}
                  isCameraOff={isCurrentUser ? isCameraOff : participant.isCameraOff}
                  isLocal={isCurrentUser}
                  isBig={isParticipantAdmin && participants.length > 1}
                  showAdminControls={isAdmin && !isCurrentUser}
                  onRemove={
                    isAdmin && !isParticipantAdmin
                      ? () => handleRemoveParticipant(participant.id)
                      : null
                  }
                  onForceUnmute={
                    isAdmin && participant.isMuted
                      ? () => handleForceUnmute(participant.id)
                      : null
                  }
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <Controls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={toggleMute}
        onToggleCamera={handleToggleCamera}
        onLeave={handleLeave}
        onEndMeeting={isAdmin ? handleEndMeeting : undefined}
        isAdmin={isAdmin}
        participantCount={participants.length}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        showParticipants={showParticipants}
      />

      {/* Participants Panel */}
      <ParticipantsList
        participants={sortedParticipants}
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
        isAdmin={isAdmin}
        onRemoveParticipant={handleRemoveParticipant}
        onForceUnmute={handleForceUnmute}
        currentUserId={user?.uid}
      />
    </div>
  );
}
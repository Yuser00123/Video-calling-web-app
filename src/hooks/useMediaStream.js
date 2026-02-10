'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const streamRef = useRef(null);

  const getStream = useCallback(async (video = false, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user' 
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      });

      // If we only have audio, create a stream with a black video track
      if (!video && audio) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const videoStream = canvas.captureStream(1);
        const videoTrack = videoStream.getVideoTracks()[0];
        stream.addTrack(videoTrack);
      }

      streamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      // Fallback: create empty stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const stream = canvas.captureStream(1);
      
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getAudioTracks().forEach(track => stream.addTrack(track));
      } catch (e) {
        console.error('Could not get audio:', e);
      }
      
      streamRef.current = stream;
      setLocalStream(stream);
      return stream;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (streamRef.current) {
      if (isCameraOff) {
        // Turn camera ON
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          });
          const newVideoTrack = videoStream.getVideoTracks()[0];
          const oldVideoTrack = streamRef.current.getVideoTracks()[0];
          
          if (oldVideoTrack) {
            streamRef.current.removeTrack(oldVideoTrack);
            oldVideoTrack.stop();
          }
          streamRef.current.addTrack(newVideoTrack);
          setIsCameraOff(false);
          return streamRef.current;
        } catch (error) {
          console.error('Error enabling camera:', error);
        }
      } else {
        // Turn camera OFF
        const videoTracks = streamRef.current.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = false;
          track.stop();
          streamRef.current.removeTrack(track);
        });
        
        // Add black video track
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const blackStream = canvas.captureStream(1);
        const blackTrack = blackStream.getVideoTracks()[0];
        streamRef.current.addTrack(blackTrack);
        
        setIsCameraOff(true);
        return streamRef.current;
      }
    }
    return streamRef.current;
  }, [isCameraOff]);

  const forceUnmute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = true;
      });
      setIsMuted(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    localStream,
    isMuted,
    isCameraOff,
    getStream,
    toggleMute,
    toggleCamera,
    forceUnmute,
    stopStream,
    setIsMuted,
  };
}
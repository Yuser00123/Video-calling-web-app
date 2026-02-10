import Peer from 'peerjs';

class PeerService {
  constructor() {
    this.peer = null;
    this.connections = new Map();
    this.calls = new Map();
    this.localStream = null;
    this.onRemoteStream = null;
    this.onPeerDisconnect = null;
  }

  initialize(userId) {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(userId, {
          host: process.env.NEXT_PUBLIC_PEER_HOST,
          port: parseInt(process.env.NEXT_PUBLIC_PEER_PORT),
          path: process.env.NEXT_PUBLIC_PEER_PATH,
          secure: true,
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
              {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
              {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject',
              },
            ],
          },
        });

        this.peer.on('open', (id) => {
          console.log('Peer connected with ID:', id);
          resolve(id);
        });

        this.peer.on('call', (call) => {
          console.log('Incoming call from:', call.peer);
          call.answer(this.localStream);

          call.on('stream', (remoteStream) => {
            if (this.onRemoteStream) {
              this.onRemoteStream(call.peer, remoteStream);
            }
          });

          call.on('close', () => {
            if (this.onPeerDisconnect) {
              this.onPeerDisconnect(call.peer);
            }
          });

          this.calls.set(call.peer, call);
        });

        this.peer.on('error', (error) => {
          console.error('Peer error:', error);
          if (error.type === 'unavailable-id') {
            // Retry with modified ID
            reject(error);
          }
        });

        this.peer.on('disconnected', () => {
          console.log('Peer disconnected, attempting reconnect...');
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  setLocalStream(stream) {
    this.localStream = stream;
  }

  callPeer(peerId) {
    return new Promise((resolve, reject) => {
      if (!this.peer || !this.localStream) {
        reject(new Error('Peer or local stream not initialized'));
        return;
      }

      try {
        const call = this.peer.call(peerId, this.localStream);

        call.on('stream', (remoteStream) => {
          if (this.onRemoteStream) {
            this.onRemoteStream(peerId, remoteStream);
          }
          resolve(remoteStream);
        });

        call.on('close', () => {
          if (this.onPeerDisconnect) {
            this.onPeerDisconnect(peerId);
          }
        });

        call.on('error', (error) => {
          console.error('Call error:', error);
          reject(error);
        });

        this.calls.set(peerId, call);
      } catch (error) {
        reject(error);
      }
    });
  }

  closeCall(peerId) {
    const call = this.calls.get(peerId);
    if (call) {
      call.close();
      this.calls.delete(peerId);
    }
  }

  replaceStream(newStream) {
    this.localStream = newStream;
    this.calls.forEach((call, peerId) => {
      const sender = call.peerConnection?.getSenders();
      if (sender) {
        const videoTrack = newStream.getVideoTracks()[0];
        const audioTrack = newStream.getAudioTracks()[0];
        sender.forEach((s) => {
          if (s.track?.kind === 'video' && videoTrack) {
            s.replaceTrack(videoTrack);
          }
          if (s.track?.kind === 'audio' && audioTrack) {
            s.replaceTrack(audioTrack);
          }
        });
      }
    });
  }

  destroy() {
    this.calls.forEach((call) => call.close());
    this.calls.clear();
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }
}

const peerService = new PeerService();
export default peerService;
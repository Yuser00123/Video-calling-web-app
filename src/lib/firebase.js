import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      return { user: userCredential.user, userData: userDoc.data() };
    }
    throw new Error('User data not found');
  } catch (error) {
    throw error;
  }
};

export const loginWithUsername = async (username, password) => {
  try {
    // Find user by username
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const userData = querySnapshot.docs[0].data();
    const email = userData.email;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, userData };
  } catch (error) {
    throw error;
  }
};

export const signupUser = async (email, username, password) => {
  try {
    // Check if username already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error('Username already taken');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      email,
      role: 'user',
      createdAt: serverTimestamp(),
    });

    return {
      user: userCredential.user,
      userData: { username, email, role: 'user' },
    };
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          resolve({ user, userData: userDoc.data() });
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    }, reject);
  });
};

// Room Functions
export const createRoom = async (roomId, adminUid, adminUsername) => {
  try {
    await setDoc(doc(db, 'rooms', roomId), {
      adminUid,
      adminUsername,
      createdAt: serverTimestamp(),
      active: true,
    });

    // Add admin as participant
    await setDoc(doc(db, 'rooms', roomId, 'participants', adminUid), {
      username: adminUsername,
      peerId: '',
      role: 'admin',
      joinedAt: serverTimestamp(),
      isMuted: false,
      isCameraOff: false,
    });

    return roomId;
  } catch (error) {
    throw error;
  }
};

export const joinRoom = async (roomId, userUid, username) => {
  try {
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    if (!roomDoc.exists()) {
      throw new Error('Room not found');
    }
    if (!roomDoc.data().active) {
      throw new Error('This meeting has ended');
    }

    // Add user as participant
    await setDoc(doc(db, 'rooms', roomId, 'participants', userUid), {
      username,
      peerId: '',
      role: 'user',
      joinedAt: serverTimestamp(),
      isMuted: false,
      isCameraOff: true,
    });

    return roomDoc.data();
  } catch (error) {
    throw error;
  }
};

export const updateParticipantPeerId = async (roomId, userUid, peerId) => {
  try {
    await updateDoc(doc(db, 'rooms', roomId, 'participants', userUid), {
      peerId,
    });
  } catch (error) {
    throw error;
  }
};

export const updateParticipantMedia = async (roomId, userUid, updates) => {
  try {
    await updateDoc(doc(db, 'rooms', roomId, 'participants', userUid), updates);
  } catch (error) {
    throw error;
  }
};

export const removeParticipant = async (roomId, userUid) => {
  try {
    await deleteDoc(doc(db, 'rooms', roomId, 'participants', userUid));
  } catch (error) {
    throw error;
  }
};

export const endRoom = async (roomId) => {
  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      active: false,
      endedAt: serverTimestamp(),
    });

    // Remove all participants
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const snapshot = await getDocs(participantsRef);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    throw error;
  }
};

export const forceUnmuteParticipant = async (roomId, userUid) => {
  try {
    await updateDoc(doc(db, 'rooms', roomId, 'participants', userUid), {
      forcedUnmute: true,
      isMuted: false,
    });
  } catch (error) {
    throw error;
  }
};

export const subscribeToRoom = (roomId, callback) => {
  return onSnapshot(doc(db, 'rooms', roomId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export const subscribeToParticipants = (roomId, callback) => {
  const participantsRef = collection(db, 'rooms', roomId, 'participants');
  return onSnapshot(participantsRef, (snapshot) => {
    const participants = [];
    snapshot.forEach((doc) => {
      participants.push({ id: doc.id, ...doc.data() });
    });
    callback(participants);
  });
};

export const leaveRoom = async (roomId, userUid) => {
  try {
    await deleteDoc(doc(db, 'rooms', roomId, 'participants', userUid));
  } catch (error) {
    throw error;
  }
};

export { auth, db };
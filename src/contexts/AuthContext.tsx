import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const isAdminEmail = user.email === 'rd14190@gmail.com' || user.email === 'admin@craftique.store' || user.email === 'admin@craftifue.store';
            // Ensure primary email is always admin
            if (isAdminEmail && data.role !== 'admin') {
              await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
              data.role = 'admin';
            }
            setProfile(data);
          } else {
            // Create a new profile if it doesn't exist
            const isAdminEmail = user.email === 'rd14190@gmail.com' || user.email === 'admin@craftique.store' || user.email === 'admin@craftifue.store';
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'Guest',
              email: user.email || '',
              photoURL: user.photoURL || '',
              role: isAdminEmail ? 'admin' : 'customer',
              addresses: [],
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth Context Error:', error);
      } finally {
        setLoading(false);
      }
    });

    // Auto-refresh user state when window gains focus (useful for email verification)
    const handleFocus = () => {
      if (auth.currentUser) {
        auth.currentUser.reload().then(() => {
          setUser({ ...auth.currentUser! });
        });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === 'admin', refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

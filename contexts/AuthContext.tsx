"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import {
  getClientAuth,
  getFirebaseApp,
  isFirebaseConfigured,
} from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    getFirebaseApp();
    const auth = getClientAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInEmail = async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error("Firebase indisponible");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error("Firebase indisponible");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInGoogle = async () => {
    const auth = getClientAuth();
    if (!auth) throw new Error("Firebase indisponible");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    const auth = getClientAuth();
    if (!auth) return;
    const { signOut: so } = await import("firebase/auth");
    await so(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseReady: isFirebaseConfigured(),
        signInEmail,
        signUpEmail,
        signInGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth dans AuthProvider");
  return ctx;
}

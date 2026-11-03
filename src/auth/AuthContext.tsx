import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { useData } from '@/data/store';
import { Member } from '@/data/types';

/**
 * Auth for the prototype. Sign-in matches an email against the member list
 * (password is accepted but not checked yet); sign-up creates a real member.
 * When Supabase is wired, only this file changes — screens use the same hook.
 *
 * `switchUser` is a demo convenience so you can hop between a member, the admin
 * and a pending voter to see every view without juggling accounts.
 */

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  userId: string | null;
  user: Member | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => AuthResult;
  signUp: (input: SignUpInput) => AuthResult;
  signOut: () => void;
  switchUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { members, memberById, addMember } = useData();
  const [userId, setUserId] = useState<string | null>(null);

  const signIn = useCallback(
    (email: string, _password: string): AuthResult => {
      const match = members.find(
        (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!match) {
        return { ok: false, error: 'No member found with that email address.' };
      }
      setUserId(match.id);
      return { ok: true };
    },
    [members],
  );

  const signUp = useCallback(
    (input: SignUpInput): AuthResult => {
      const exists = members.some(
        (m) => m.email.toLowerCase() === input.email.trim().toLowerCase(),
      );
      if (exists) return { ok: false, error: 'That email is already registered.' };
      const member = addMember({
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
      });
      setUserId(member.id);
      return { ok: true };
    },
    [members, addMember],
  );

  const signOut = useCallback(() => setUserId(null), []);
  const switchUser = useCallback((id: string) => setUserId(id), []);

  const user = userId ? memberById(userId) ?? null : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      user,
      isAdmin: user?.role === 'admin',
      signIn,
      signUp,
      signOut,
      switchUser,
    }),
    [userId, user, signIn, signUp, signOut, switchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

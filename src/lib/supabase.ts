import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

/**
 * Supabase client.
 *
 * The app currently runs on the in-memory store in `src/data/store.tsx` so you
 * can explore every screen with no backend. When you are ready to go live:
 *
 *   1. Create a project at https://supabase.com and run `supabase/schema.sql`.
 *   2. Copy `.env.example` to `.env` and fill in the URL + anon key.
 *   3. Replace the mock reads/writes inside `DataProvider` with calls to this
 *      client (the method names there already match the table shapes).
 *
 * Nothing imports this file yet, so it has no effect until you wire it in.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        // Persist the session on native; the web client uses localStorage.
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

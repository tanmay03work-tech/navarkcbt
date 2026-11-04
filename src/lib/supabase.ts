import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://zehawfzexgsxovwsfyyz.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplaGF3ZnpleGdzeG92d3NmeXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTkzNzQsImV4cCI6MjEwOTE5NTM3NH0.hY-Aj_oaKvP6IqHLzv6z2Vf496CGyYsIkpRtIL1aOUY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

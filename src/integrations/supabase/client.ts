// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xprqjqtvuznkjcuyertb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcnFqcXR2dXpua2pjdXllcnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjkwMTcsImV4cCI6MjA1NjM0NTAxN30.9eiU39ptNCmrv4ZNlip2TA0UQK689dhXXcWjo8CokiM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
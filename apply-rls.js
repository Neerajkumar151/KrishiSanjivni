import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xfeeizryotmnopvgevmf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZWVpenJ5b3Rtbm9wdmdldm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAyMDI3MiwiZXhwIjoyMDcxNTk2MjcyfQ.bdciPJ9nWm6lbKGz9KeowZxca3Gq3snCkhqZ6rGF78I";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLS() {
    console.log("Applying RLS fix...");

    // Using an RPC call if available, or direct query through Postgres REST
    // Since we can't easily execute raw DDL via the standard REST API, we'll
    // log instructions for the user to paste in the SQL editor.
    console.log(`
To fix the critical vulnerability, please go to your Supabase Dashboard:
https://supabase.com/dashboard/project/xfeeizryotmnopvgevmf/sql/new

And paste/run this exact SQL:

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE public.chat_messages
ALTER COLUMN conversation_id SET NOT NULL;
  `);
}

fixRLS();

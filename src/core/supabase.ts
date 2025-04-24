import { createClient } from "@supabase/supabase-js"
import type { SupportedStorage } from "@supabase/supabase-js"
 
import { Storage } from "@plasmohq/storage"
 
const storage = new Storage({
  area: "local"
})
 
export const supabase = createClient(
  process.env.PLASMO_PUBLIC_SUPABASE_URL || "",
  process.env.PLASMO_PUBLIC_SUPABASE_KEY || "",
  {
    auth: {
      storage: storage as SupportedStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
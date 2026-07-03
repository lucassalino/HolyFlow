import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fbbdltbnouznzlsufyfp.supabase.co'
const SUPABASE_KEY = 'sb_publishable_CLnGWT7caOI1Yx5HH6bppQ_L2rWl_5R'

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

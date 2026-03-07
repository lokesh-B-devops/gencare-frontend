const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url_here') {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[Supabase] Client initialized successfully.');
    } catch (err) {
        console.error('[Supabase] Initialization error:', err.message);
    }
}

module.exports = supabase;

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

const isPlaceholder = !supabaseUrl ||
    supabaseUrl.includes('your_') ||
    supabaseUrl.includes('supabase.co') === false ||
    !supabaseUrl.startsWith('http');

if (!isPlaceholder && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[Supabase] Client initialized successfully.');
    } catch (err) {
        console.error('[Supabase] Initialization error:', err.message);
    }
} else {
    console.warn('[Supabase] Client skipped initialization: Missing or invalid credentials.');
}

module.exports = supabase;

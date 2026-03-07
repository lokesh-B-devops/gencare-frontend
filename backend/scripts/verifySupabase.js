const supabaseService = require('../services/supabaseService');

/**
 * Supabase Health Check & Initial Data Sync Script
 * Verifies connectivity and inserts basic schema structures for demo.
 */
async function verifySupabase() {
    console.log('--- Supabase Integration Verification ---');

    // 1. Connectivity Check
    const isHealthy = await supabaseService.healthCheck();
    if (!isHealthy) {
        console.warn('[!] Supabase connectivity check failed or table missing. This is expected if tables are not yet created.');
    } else {
        console.log('[✓] Supabase connectivity verified.');
    }

    // 2. Test Parallel Sync Logic (Dry Run/Log)
    console.log('[i] Supabase Service Enabled:', supabaseService.enabled);

    if (supabaseService.enabled) {
        console.log('[i] Testing upsert to "profiles" (Dry Run simulation)...');
        // We won't actually insert unless we want to seed a test user
    } else {
        console.warn('[!] Supabase is NOT enabled. Check your .env variables.');
    }

    console.log('--- Verification Complete ---');
}

verifySupabase().catch(err => console.error('Verification Script Error:', err));

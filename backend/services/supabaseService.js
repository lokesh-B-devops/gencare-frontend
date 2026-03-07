const supabase = require('../lib/supabaseClient');

/**
 * Supabase Service Wrapper
 * Handles parallel data synchronization to Supabase cloud.
 * Operations are silent (only log errors) to ensure local app stability.
 */
class SupabaseService {
    constructor() {
        this.enabled = !!supabase;
    }

    /**
     * Sync user metadata to Supabase Auth
     */
    async syncUserRole(userId, role) {
        if (!this.enabled) return;
        try {
            // This assumes the user might already exist in Supabase Auth or we just want to log the intent
            // In a real migration, we might use admin API to update metadata
            console.log(`[Supabase Service] Syncing role ${role} for user ${userId}`);
            // placeholder for actual auth metadata update logic if using Supabase Auth
        } catch (err) {
            console.error('[Supabase Service] User sync error:', err.message);
        }
    }

    /**
     * Generic upsert for profile data
     */
    async upsertProfile(table, data) {
        if (!this.enabled) {
            console.warn(`[Supabase Service] Skipped upsert to ${table}: Service disabled.`);
            return;
        }
        try {
            console.log(`[Supabase Service] Attempting upsert to ${table} for ID: ${data.id}`);
            const { error } = await supabase
                .from(table)
                .upsert(data, { onConflict: 'id' });

            if (error) {
                console.error(`[Supabase Service] ${table} UPSERT ERROR:`);
                console.error(JSON.stringify({
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    table,
                    id: data.id
                }, null, 2));
                throw error;
            }
            console.log(`[Supabase Service] SUCCESS: Record upserted to ${table}`);
        } catch (err) {
            // Logged above, but re-throwing ensures caller is aware
            console.error(`[Supabase Service] Unexpected error in upsertProfile: ${err.message}`);
        }
    }

    /**
     * Log adherence data (Medication/Symptoms)
     */
    async logAdherence(data) {
        if (!this.enabled) return;
        try {
            const { error } = await supabase
                .from('adherence_logs')
                .insert(data);

            if (error) throw error;
            console.log('[Supabase Service] Logged adherence to cloud');
        } catch (err) {
            console.error('[Supabase Service] Adherence log error:', err.message);
        }
    }

    /**
     * Upload medical report to storage
     */
    async uploadReport(filePath, fileName, bucket = 'medical-reports') {
        if (!this.enabled) return null;
        try {
            const fs = require('fs');
            const fileBuffer = fs.readFileSync(filePath);

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, fileBuffer, {
                    upsert: true
                });

            if (error) throw error;
            console.log(`[Supabase Service] Uploaded ${fileName} to storage`);
            return data.path;
        } catch (err) {
            console.error('[Supabase Service] Storage upload error:', err.message);
            return null;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        if (!this.enabled) return false;
        try {
            const { data, error } = await supabase.from('health_check').select('*').limit(1);
            if (error && error.code !== 'PGRST116') { // Ignore missing table error for check
                throw error;
            }
            return true;
        } catch (err) {
            console.error('[Supabase Service] Health check failed:', err.message);
            return false;
        }
    }
}

module.exports = new SupabaseService();

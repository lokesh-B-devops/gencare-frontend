const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * @route GET /api/health/gemini
 * @desc Isolated diagnostic check for Gemini API
 * @access Admin/Internal (Public for this diagnostic)
 */
router.get('/gemini', async (req, res) => {
    const startTime = Date.now();
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
        console.error('[HealthCheck] GEMINI_API_KEY is missing');
        return res.status(500).json({
            status: "Error",
            error_code: "MISSING_API_KEY",
            error_message: "GEMINI_API_KEY is not set in Railway environment variables."
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent('Say: OK');
        const responseText = result.response.text().trim();
        const latency = Date.now() - startTime;

        console.log(`[HealthCheck] Gemini OK in ${latency}ms: ${responseText}`);

        res.json({
            status: "OK",
            model: "gemini-1.5-flash",
            latency_ms: latency,
            key_prefix: key.substring(0, 8) + "...",
            ai_response: responseText
        });
    } catch (error) {
        const latency = Date.now() - startTime;
        console.error(`[HealthCheck] Gemini failure in ${latency}ms:`, error.message);

        res.status(500).json({
            status: "Error",
            error_code: error.status || error.code || "API_ERROR",
            error_message: error.message,
            key_prefix: key.substring(0, 8) + "...",
            latency_ms: latency
        });
    }
});

module.exports = router;

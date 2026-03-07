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
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error('[HealthCheck] GEMINI_API_KEY is missing');
            return res.status(500).json({
                status: "Gemini Error",
                error_code: "MISSING_API_KEY",
                error_message: "GEMINI_API_KEY is not configured in the environment variables."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Simple read-only diagnostic prompt
        const result = await model.generateContent('Respond with OK if reachable');
        const responseText = result.response.text().trim();
        const latency = Date.now() - startTime;

        console.log(`[HealthCheck] Gemini success: Status OK, Latency: ${latency}ms`);

        res.json({
            status: "Gemini Connected",
            model: "1.5 Flash"
        });
    } catch (error) {
        const latency = Date.now() - startTime;
        console.error(`[HealthCheck] Gemini failure: Latency: ${latency}ms, Error: ${error.message}`);

        res.status(500).json({
            status: "Gemini Error",
            error_code: error.code || "API_ERROR",
            error_message: error.message
        });
    }
});

module.exports = router;

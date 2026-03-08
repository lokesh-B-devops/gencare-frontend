const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Always read the key fresh from env so Railway variable changes take effect without redeploy
function getGenAI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not configured');
    console.log(`[AI] Initializing GenAI with key: ${key.substring(0, 6)}... (length: ${key.length})`);
    return new GoogleGenerativeAI(key);
}

const MODEL_PRIORITY = [
    'gemini-2.0-flash-001',
    'gemini-2.0-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.0-pro-exp-0205',
    'gemini-2.0-flash-thinking-exp-1219'
];



/**
 * Main entry point for content generation with multi-model fallback.
 * Tries each model in MODEL_PRIORITY, and for each, performs retries on 429s.
 */
async function generateWithFallback(content, options = {}) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of MODEL_PRIORITY) {
        try {
            console.log(`[AI] >>> Attempting Model: ${modelName} <<<`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Perform generation with its own retry logic for this specific model
            const result = await generateWithRetry(model, content);
            if (result) return result;
        } catch (err) {
            lastError = err;
            console.error(`[AI DEBUG] Model ${modelName} CRITICAL FAILURE:`);
            console.error(JSON.stringify({
                model: modelName,
                errorMessage: err.message,
                status: err.status,
                stack: err.stack?.split('\n').slice(0, 3).join('\n')
            }, null, 2));

            const errStr = err.message || String(err);
            console.warn(`[AI Fallback] Moving to next model due to: ${errStr.slice(0, 100)}...`);
            // Continue to next model in priority list
        }
    }

    console.error('[AI] FATAL: All models and retries exhausted.');
    throw lastError || new Error('All AI models failed');
}

/**
 * Generate content with robust exponential backoff on 429 rate-limit errors.
 */
async function generateWithRetry(model, content, maxRetries = 3) {
    console.log(`[AI] Starting generation pipeline for model: ${model.model}`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Log the request structure (partially, avoid logging massive payloads)
            console.log(`[AI] Request Attempt ${attempt}/${maxRetries}`);

            const result = await model.generateContent(content);

            // Validate response
            if (!result || !result.response) {
                throw new Error("Empty response from Gemini API");
            }

            console.log(`[AI SUCCESS] Model: ${model.model} | Attempt: ${attempt}`);
            return result;
        } catch (err) {
            const errStr = err.message || String(err);
            const status = err.status || 500;

            console.error(`[AI ERROR] Attempt ${attempt} failed for ${model.model}`);
            console.error(`[AI ERROR DETAIL] Status: ${status} | Message: ${errStr}`);

            // Detection logic as requested
            const isRateLimit = status === 429 || errStr.includes('429') || errStr.includes('quota');
            const isInvalidKey = status === 401 || errStr.includes('API_KEY_INVALID');
            const isNotFound = status === 404 || errStr.includes('not found');

            if (isRateLimit && attempt < maxRetries) {
                // Calculate exponential backoff: 5s * 2^(attempt-1) + jitter
                const backoffMs = (Math.pow(2, attempt - 1) * 5000) + (Math.random() * 1000);
                console.warn(`[AI RETRY] Rate limit hit. Retrying via Exponential Backoff in ${Math.round(backoffMs / 1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
                continue;
            }

            // For other terminal errors or max retries reached, throw to trigger model fallback
            if (isInvalidKey) console.error("[AI CONFIG] CRITICAL: Invalid GEMINI_API_KEY");
            if (isNotFound) console.error(`[AI CONFIG] Model ${model.model} not found or not enabled.`);

            throw err;
        }
    }
}

/**
 * Embryo Transfer Guidance
 */
exports.generateEmbryoGuidance = async (patientData) => {
    try {
        const prompt = `
        You are a medical decision-support AI for IVF embryo transfer.
        Analyze the following patient data to provide probabilistic guidance for embryo transfer (Single vs Double).
        
        Patient Data:
        - Age: ${patientData.age}
        - IVF Cycles: ${patientData.cycleNumber}
        - Embryo Stage: ${patientData.embryoStage}
        - Embryo Quality: ${patientData.embryoQuality}
        - Uterine Health: ${patientData.uterineHealth}
        - Risk Factors: ${patientData.riskFactors?.join(', ') || 'None'}
        
        STRICT RULES:
        1. Do NOT perform diagnosis, prediction, or automatic decision-making.
        2. Provide probabilistic guidance and risk visualization only.
        3. Do NOT guarantee outcomes (e.g., twins or triplets).
        4. Outcomes MUST be ranges, not exact numbers.
        5. Clearly indicate uncertainty.
        6. Always include maternal and neonatal risks.
        
        Required Output (JSON format only):
        {
          "singleTransferProb": number (0-100),
          "doubleTransferProb": number (0-100),
          "outcomes": {
            "single": "Description",
            "double": "Description",
            "tripletRisk": "Description"
          },
          "uncertainty": "Description",
          "maternalRisks": ["risk 1"],
          "neonatalRisks": ["risk 1"],
          "pretermBirthRisk": "Description"
        }
        `;

        const result = await generateWithFallback(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch (error) {
        console.error('AI Guidance Generation Failed:', error.message);
        return {
            singleTransferProb: 50,
            doubleTransferProb: 30,
            outcomes: {
                single: "Success rates are typically personalized based on clinical review.",
                double: "Multiple gestation risks are significantly higher.",
                tripletRisk: "Statistically rare but clinically relevant."
            },
            uncertainty: "Data provided requires further clinical correlation.",
            maternalRisks: ["General pregnancy risks"],
            neonatalRisks: ["General neonatal risks"],
            pretermBirthRisk: "Varies by gestation count."
        };
    }
};

/**
 * Symptom Analysis
 */
exports.analyzeSymptom = async (description, filePath, mimeType) => {
    try {
        let content;
        const prompt = `
            As a supportive medical AI assistant for IVF patients, analyze this reported symptom.
            Patient's description: "${description}"
            
            Provide a response in JSON format ONLY:
            {
                "summary": "Reassuring one-sentence summary",
                "details": "Patient-friendly explanation of why this might happen during IVF",
                "recommendations": ["Reassuring next step 1", "Reassuring next step 2"]
            }
            Keep the tone calm and encouraging. Avoid definitive diagnosis.
        `;

        if (filePath && fs.existsSync(filePath)) {
            const imageData = {
                inlineData: {
                    data: fs.readFileSync(filePath).toString("base64"),
                    mimeType: mimeType,
                },
            };
            content = [prompt, imageData];
        } else {
            content = [prompt];
        }

        const result = await generateWithFallback(content);
        const responseText = result.response.text();
        console.log(`[AI] Symptom Analysis Success: ${responseText.slice(0, 50)}...`);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch (error) {
        console.error('Symptom Analysis Failed:', error.message);
        return {
            summary: "Symptom logged for doctor review.",
            details: "Your report has been securely saved. Our AI is currently busy, but your care team will monitor this.",
            recommendations: ["Track any changes", "Stay hydrated", "Contact clinic if pain increases"]
        };
    }
};

/**
 * Virtual Assistant Chat
 */
exports.generateChatResponse = async (userContent, category) => {
    try {
        const prompt = `
            You are a supportive, knowledgeable virtual medical assistant for an IVF clinic. 
            A patient asked: "${userContent}"
            Category: ${category || 'general'}
            
            Provide a reassuring, professional, and helpful response. 
            - If it's about symptoms, be empathetic.
            - If it's about medications, explain their role in IVF.
            - Keep the tone warm and encouraging.
            - Keep the response concise (2-4 sentences).
        `;

        const result = await generateWithFallback(prompt);
        const responseText = result.response.text();
        console.log(`[AI] Chat Response Success: ${responseText.slice(0, 50)}...`);
        return responseText;
    } catch (error) {
        console.error('Chat AI Failed. Error details:', {
            message: error.message,
            stack: error.stack
        });
        return "I'm experiencing high traffic right now, but your journey is very important to us. Please contact your clinic directly for any urgent questions.";
    }
};

/**
 * Medical Document Analysis
 */
exports.analyzeMedicalDocument = async (filePath, mimeType) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64File = fileBuffer.toString('base64');

        const prompt = `
            Analyze this medical report and explain it to the patient in simple, reassuring terms.
            Return JSON:
            {
                "summary": "Clear summary",
                "details": "Patient-friendly breakdown",
                "recommendations": ["Next step 1", "Next step 2"]
            }
        `;

        const content = [
            prompt,
            {
                inlineData: {
                    data: base64File,
                    mimeType: mimeType
                }
            }
        ];

        const result = await generateWithFallback(content);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch (error) {
        console.error('Document Analysis Failed:', error.message);
        return {
            summary: "Report uploaded successfully.",
            details: "AI analysis is currently unavailable, but your doctor will review this report.",
            recommendations: ["Check back later for analysis", "Discuss with your doctor at the next visit"]
        };
    }
};


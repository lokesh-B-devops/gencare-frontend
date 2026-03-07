const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './backend/.env' });

async function listModels() {
    console.log("Listing available Gemini models...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY is not set.");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The listModels method is actually part of the generative-ai-js library's internal client usually, 
        // or we can just try common ones.
        // Actually, let's try a few common ones and see which one doesn't throw a location error.

        const modelsToTest = [
            "models/gemini-1.5-flash",
            "models/gemini-1.5-pro",
            "models/gemini-2.0-flash",
            "models/gemini-2.0-flash-exp",
            "models/gemini-1.0-pro"
        ];

        for (const modelName of modelsToTest) {
            try {
                console.log(`Testing ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                console.log(`✅ ${modelName} works!`);
                process.exit(0);
            } catch (e) {
                console.log(`❌ ${modelName} failed: ${e.message}`);
            }
        }
        console.log("No models worked.");
    } catch (error) {
        console.error("Listing Error:", error.message);
    }
}

listModels();

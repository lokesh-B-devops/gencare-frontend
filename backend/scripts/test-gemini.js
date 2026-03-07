const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './backend/.env' });

async function testGemini() {
    console.log("Testing Gemini API Key...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY is not set in backend/.env");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Sending test prompt to gemini-1.5-flash...");
        const result = await model.generateContent("Say 'Hello, I am Gemini 1.5 Flash and I am working!'");
        console.log("Response:", result.response.text());
        console.log("Success! Gemini 1.5 Flash is connected.");
    } catch (error) {
        console.error("Gemini API Error:");
        console.error(error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

testGemini();

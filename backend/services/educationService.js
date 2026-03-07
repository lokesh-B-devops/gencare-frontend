const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Service to generate patient-friendly educational content for medications using Gemini AI.
 */
class EducationService {
    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.getModel();
        } else {
            console.warn("[EducationService] GEMINI_API_KEY not found. Simulation mode enabled.");
        }
    }

    /**
     * Robustly get a generative model with fallback
     */
    getModel() {
        const modelNames = [
            "models/gemini-2.5-flash",
            "gemini-2.0-flash",
            "models/gemini-2.0-flash",
            "models/gemini-2.0-flash-lite",
            "models/gemini-flash-latest"
        ];

        for (const name of modelNames) {
            try {
                const model = this.genAI.getGenerativeModel({ model: name });
                if (model) {
                    console.log(`[EducationService] Initialized with model: ${name}`);
                    return model;
                }
            } catch (e) {
                console.warn(`[EducationService] Model ${name} initialization failed, trying next...`);
            }
        }
        // Final fallback
        return this.genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    }

    async generateMedicationExplanation(medName, dosage, stage) {
        if (!this.genAI) {
            return this.getSimulatedExplanation(medName, stage);
        }

        const prompt = `
            You are a medical UX writer specializing in fertility care. 
            Explain the following medication to an IVF patient in simple, reassuring terms (Grade 6-8 readability).
            
            Medication Name: ${medName}
            Dosage: ${dosage}
            Current IVF Stage: ${stage}
            
            Provide the explanation in the following JSON format:
            {
                "purpose": "A one-sentence explanation of why this medicine is given.",
                "howItWorks": "A simple, non-technical explanation of how it works in the body.",
                "stageRelevance": "Why this specific medication is important during the ${stage} stage.",
                "sideEffects": "A bulleted list of 2-3 mild, common side effects (avoid scary language).",
                "tips": "Practical storage or injection tips (e.g., site rotation, food timing)."
            }
            
            Guidelines:
            - Avoid medical jargon (e.g., instead of 'GnRH antagonist', say 'blocks early egg release').
            - Be empathetic and supportive.
            - Do NOT give dosage advice or suggest changes.
            - Keep it concise.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // Extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Invalid AI response format");
        } catch (error) {
            console.error("[EducationService] AI Generation Error:", error);
            return this.getSimulatedExplanation(medName, stage);
        }
    }

    getSimulatedExplanation(medName, stage) {
        // Fallback/Simulation data if AI fails or key is missing
        return {
            purpose: `To support your body during the ${stage} phase of IVF treatment.`,
            howItWorks: `This medication helps balance your hormones to optimize the ${stage} process.`,
            stageRelevance: `It ensures your body stays on track for a successful ${stage} phase.`,
            sideEffects: "• Mild discomfort at injection site\n• Slight bloating\n• Mild seasonal mood changes",
            tips: "• Rotate injection sites daily\n• Store in a cool, dry place\n• Take at the same time each day for best results"
        };
    }
}

module.exports = new EducationService();

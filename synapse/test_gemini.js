const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the instance in some versions, 
        // but let's try a simple generation to see if it works with a different name 
        // or if we can get more info. 
        // Actually, the error message suggests calling ListModels.
        // In the Node SDK, it might be via the API directly or a specific method if available.
        // Let's try to just run a simple generation with 'gemini-pro' as a fallback check.

        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash");
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);
    }

    try {
        console.log("Testing gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("Success with gemini-pro");
    } catch (error) {
        console.error("Error with gemini-pro:", error.message);
    }
}

listModels();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanModels() {
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
    
    for (const modelName of models) {
        try {
            console.log(`--- Probando modelo: ${modelName} ---`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hola");
            const response = await result.response;
            console.log(`✅ ¡ÉXITO! Respuesta de ${modelName}:`, response.text());
            return; // Si uno funciona, paramos
        } catch (error) {
            console.log(`❌ Falló ${modelName}: ${error.message}`);
        }
    }
}

scanModels();

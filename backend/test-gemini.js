const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1" });

async function test() {
    try {
        console.log("Iniciando prueba con gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Llamando a generateContent...");
        const result = await model.generateContent("Hola, esto es una prueba.");
        console.log("Esperando respuesta...");
        const response = await result.response;
        console.log("Respuesta obtenida:", response.text());
    } catch (error) {
        console.error("Error en la prueba:", error);
        if (error.response) {
            console.error("Detalles del error:", await error.response.json());
        }
    }
}

test();

/**
 * AGENTE IA CAMALEÓN - VERSIÓN YOUTUBE (5 MINUTOS) 🚀
 * Arquitectura: Express + Green API + Gemini AI + Google Docs/Sheets
 */

const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// --- 1. LAS 6 VARIABLES DE ENTORNO (Configuradas en Railway) ---
const {
    GEMINI_API_KEY,
    ID_INSTANCE,
    API_TOKEN_INSTANCE,
    DOC_ID,
    SHEET_ID,
    GOOGLE_CREDENTIALS
} = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Memoria RAM simple para recordar la conversación (Ideal para pruebas rápidas)
const memoryCache = new Map();

// --- 2. EL CEREBRO: PROMPT MAESTRO Y REGLAS ---
function buildSystemPrompt(docRules, sheetInventory) {
    return `
### 🎯 IDENTIDAD Y MISIÓN ###
Eres un agente de ventas de Inteligencia Artificial altamente capacitado.
Tu personalidad, reglas de negocio y forma de hablar están definidas estrictamente en este documento de la empresa:
--- REGLAS DEL NEGOCIO (GOOGLE DOCS) ---
${docRules}

Tu catálogo de productos, precios y stock en tiempo real están en esta tabla:
--- INVENTARIO (GOOGLE SHEETS) ---
${sheetInventory}

### 🎨 REGLAS DE FORMATO PARA WHATSAPP (INQUEBRANTABLES) ###
1. PROHIBIDO USAR MARKDOWN TRADICIONAL. WhatsApp NO soporta doble asterisco (**texto**).
2. Usa ÚNICA Y EXCLUSIVAMENTE UN (1) asterisco para poner *negritas* (ejemplo: *Hola*).
3. Prohibido usar numerales (#) para títulos.
4. Escribe mensajes cortos, estilo ping-pong. Usa espacios dobles (ENTER) entre párrafos para que sea fácil de leer.
5. Usa máximo 1 o 2 emojis por mensaje para mantener la elegancia. No satures.
6. NUNCA menciones que lees un "Excel", "Documento" o "Google Sheets". Actúa natural.

### 🛡️ REGLA ANTI-ALUCINACIÓN (AMNESIA TOTAL) ###
Si el cliente pregunta por un producto, precio o política que NO está en el Inventario (Sheets) o en las Reglas (Docs), DEBES DECIR QUE NO LO TIENES. Tienes amnesia total sobre el mundo exterior. JAMÁS inventes precios ni ofrezcas cosas que no estén en tus datos.
`;
}

// --- 3. FUNCIONES PARA LEER GOOGLE DOCS Y SHEETS ---
async function fetchCompanyData() {
    try {
        const credentials = JSON.parse(GOOGLE_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: credentials.client_email, private_key: credentials.private_key },
            scopes: ['https://www.googleapis.com/auth/documents.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        const docs = google.docs({ version: 'v1', auth });
        const sheets = google.sheets({ version: 'v4', auth });

        // Leer Reglas del Negocio (Docs)
        const docResult = await docs.documents.get({ documentId: DOC_ID });
        const docText = docResult.data.body.content
            .map(element => element.paragraph?.elements.map(e => e.textRun?.content).join('') || '')
            .join('');

        // Leer Inventario (Sheets)
        const sheetResult = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'A:Z' });
        const sheetText = (sheetResult.data.values || []).map(row => row.join(' | ')).join('\n');

        return { rules: docText, inventory: sheetText };
    } catch (error) {
        console.error("❌ Error leyendo Google (Revisa tus credenciales):", error.message);
        return { rules: "Error leyendo reglas.", inventory: "Error leyendo inventario." };
    }
}

// --- 4. FUNCIÓN PARA ENVIAR WHATSAPP (GREEN API) ---
async function sendGreenApiMessage(chatId, text) {
    const url = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`;
    try {
        await axios.post(url, { chatId: chatId, message: text });
    } catch (e) {
        console.error("❌ Error enviando mensaje a WhatsApp:", e.message);
    }
}

// --- 5. RECEPCIÓN DE MENSAJES (EL WEBHOOK) ---
app.post('/webhook', async (req, res) => {
    res.status(200).send('OK'); // Responder rápido a Green API

    try {
        const body = req.body;
        // Solo nos interesan los mensajes entrantes
        if (body.typeWebhook !== 'incomingMessageReceived') return;

        const messageData = body.messageData;
        const senderData = body.senderData;
        const chatId = senderData.chatId; // Ejemplo: 51999999999@c.us

        // Ignorar mensajes de grupos o estados
        if (chatId.includes('@g.us') || chatId === 'status@broadcast') return;

        let userText = "";

        // Detectar si es Texto normal
        if (messageData.typeMessage === 'textMessage') {
            userText = messageData.textMessageData.textMessage;
        } 
        // Detectar si es Texto respondiendo a otro mensaje (Quote)
        else if (messageData.typeMessage === 'extendedTextMessage') {
            userText = messageData.extendedTextMessageData.text;
        }
        // Detectar Imagen (Lee la descripción de la foto si la hay)
        else if (messageData.typeMessage === 'imageMessage') {
            const caption = messageData.imageMessageData.caption || "";
            userText = `[El usuario envió una imagen]. ${caption}`;
        }
        // Detectar Audio
        else if (messageData.typeMessage === 'audioMessage') {
            // Nota: Para este tutorial express de 5 min, le indicamos a la IA que asuma que no puede escuchar audios.
            userText = "[El usuario envió un mensaje de voz. Pídele amablemente que escriba porque estás en un entorno ruidoso]";
        }

        if (!userText) return;

        // --- CEREBRO GEMINI EN ACCIÓN ---
        
        // 1. Obtener Historial de la RAM
        let history = memoryCache.get(chatId) || [];
        history.push({ role: "user", parts: [{ text: userText }] });

        // 2. Leer Docs y Sheets frescos en cada mensaje (¡Actualización en tiempo real!)
        const companyData = await fetchCompanyData();
        const systemPrompt = buildSystemPrompt(companyData.rules, companyData.inventory);

        // 3. Llamar a la Inteligencia Artificial
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: systemPrompt 
        });

        // Enviamos el historial menos el último mensaje, y el último mensaje por separado
        const chat = model.startChat({ history: history.slice(0, -1) });
        const result = await chat.sendMessage(userText);
        
        const botReply = result.response.text();

        // 4. Guardar respuesta en memoria y mantener solo los últimos 10 mensajes (para no saturar RAM)
        history.push({ role: "model", parts: [{ text: botReply }] });
        if (history.length > 10) history = history.slice(history.length - 10);
        memoryCache.set(chatId, history);

        // 5. Enviar la respuesta por WhatsApp
        await sendGreenApiMessage(chatId, botReply);

    } catch (error) {
        console.error("❌ Error General en el Bot:", error);
    }
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Agente Camaleón encendido y escuchando en el puerto ${PORT}`);
});
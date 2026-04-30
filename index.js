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

// --- 1. LAS 7 VARIABLES DE ENTORNO (Configuradas en Railway) ---
const {
    GEMINI_API_KEY,
    GREEN_API_URL,      // ¡NUEVA VARIABLE! (Ej. https://7107.api.greenapi.com)
    ID_INSTANCE,
    API_TOKEN_INSTANCE,
    DOC_ID,
    SHEET_ID,
    GOOGLE_CREDENTIALS
} = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Memoria RAM simple para recordar la conversación
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

        // Leer Reglas del Negocio (Docs) - Lee todo el documento
        const docResult = await docs.documents.get({ documentId: DOC_ID });
        const docText = docResult.data.body.content
            .map(element => element.paragraph?.elements.map(e => e.textRun?.content).join('') || '')
            .join('');

        // Leer Inventario (Sheets) - Forzamos leer solo la primera hoja ('Sheet1' o 'Hoja 1' genérico)
        // Pedimos leer toda la hoja activa, sin importar el nombre, para evitar errores si el usuario cambia el nombre de la pestaña
        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const firstSheetName = sheetInfo.data.sheets[0].properties.title;
        
        const sheetResult = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${firstSheetName}!A:Z` });
        const sheetText = (sheetResult.data.values || []).map(row => row.join(' | ')).join('\n');

        return { rules: docText, inventory: sheetText };
    } catch (error) {
        console.error("❌ Error leyendo Google:", error.message);
        return { rules: "Error", inventory: "Error" };
    }
}

// --- 4. FUNCIÓN PARA ENVIAR WHATSAPP (GREEN API) ---
async function sendGreenApiMessage(chatId, text) {
    // Usamos la URL base dinámica que el usuario configuró en Railway
    const url = `${GREEN_API_URL}/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`;
    try {
        await axios.post(url, { chatId: chatId, message: text });
    } catch (e) {
        console.error("❌ Error enviando mensaje a WhatsApp:", e.message);
    }
}

// --- 5. RECEPCIÓN DE MENSAJES (EL WEBHOOK) ---
app.post('/webhook', async (req, res) => {
    res.status(200).send('OK');

    try {
        const body = req.body;
        if (body.typeWebhook !== 'incomingMessageReceived') return;

        const messageData = body.messageData;
        const senderData = body.senderData;
        const chatId = senderData.chatId;

        if (chatId.includes('@g.us') || chatId === 'status@broadcast') return;

        let userText = "";

        if (messageData.typeMessage === 'textMessage') {
            userText = messageData.textMessageData.textMessage;
        } else if (messageData.typeMessage === 'extendedTextMessage') {
            userText = messageData.extendedTextMessageData.text;
        } else if (messageData.typeMessage === 'imageMessage') {
            const caption = messageData.imageMessageData.caption || "";
            userText = `[Imagen enviada]. ${caption}`;
        } else if (messageData.typeMessage === 'audioMessage') {
            userText = "[Audio recibido. Pide al usuario que escriba texto.]";
        }

        if (!userText) return;

        let history = memoryCache.get(chatId) || [];
        history.push({ role: "user", parts: [{ text: userText }] });

        const companyData = await fetchCompanyData();
        const systemPrompt = buildSystemPrompt(companyData.rules, companyData.inventory);

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: systemPrompt 
        });

        const chat = model.startChat({ history: history.slice(0, -1) });
        const result = await chat.sendMessage(userText);
        const botReply = result.response.text();

        history.push({ role: "model", parts: [{ text: botReply }] });
        if (history.length > 10) history = history.slice(history.length - 10);
        memoryCache.set(chatId, history);

        await sendGreenApiMessage(chatId, botReply);

    } catch (error) {
        console.error("❌ Error General:", error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));

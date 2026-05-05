/**
 * AGENTE DE VENTAS IA - VERSIÓN YOUTUBE 🚀
 * Arquitectura: Express + Green API + Gemini AI + Google Docs/Sheets
 * Funciones: Caché RAM, Anti-Metralleta (8s), Handoff Automático y Escudo Multimedia.
 */

const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// --- 1. LAS 7 VARIABLES DE ENTORNO ---
const {
    GEMINI_API_KEY,
    GREEN_API_URL,
    ID_INSTANCE,
    API_TOKEN_INSTANCE,
    DOC_ID,
    SHEET_ID,
    GOOGLE_CREDENTIALS
} = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- 2. MEMORIA RAM AVANZADA ---
const memoryCache = new Map(); // Guarda el estado de cada cliente

// Caché global para no saturar la API de Google
let companyDataCache = { rules: "", inventory: "", lastFetch: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos de vida en la RAM

// --- 3. EL CEREBRO: PROMPT MAESTRO ---
function buildSystemPrompt(docRules, sheetInventory) {
    return `
### 🎯 IDENTIDAD Y MISIÓN ###
Eres un agente de ventas de Inteligencia Artificial altamente capacitado.
Tu personalidad y reglas de negocio están en este documento:
--- REGLAS DEL NEGOCIO ---
${docRules}

Tu inventario en tiempo real está aquí:
--- INVENTARIO ---
${sheetInventory}

### 🎨 REGLAS DE FORMATO (INQUEBRANTABLES) ###
1. PROHIBIDO USAR MARKDOWN TRADICIONAL. Solo usa UN (1) asterisco para *negritas*.
2. Escribe mensajes cortos. Usa espacios dobles (ENTER) entre párrafos.
3. Máximo 1 o 2 emojis por mensaje. No satures.
4. NUNCA menciones que lees un "Excel" o "Documento".

### 📚 REGLA PARA EL CATÁLOGO ###
Si el cliente quiere ver todos los productos, fotos, o pide "el catálogo", NO le listes todo el Excel. Simplemente entrégale el Link del Catálogo/Web que está en tus REGLAS DEL NEGOCIO de forma amable.

### 🛡️ REGLA DE ENFOQUE Y VERDAD ABSOLUTA ###
1. Tu único trabajo es responder dudas que puedas solucionar ESTRICTAMENTE con la información de tus REGLAS DEL NEGOCIO y tu INVENTARIO. Estas dos fuentes son tu VERDAD ABSOLUTA.
2. Si el cliente pregunta algo o cambia a un tema que no sabes, que no está en tus documentos o que no tiene nada que ver con el negocio, responde SÚPER CORTO diciendo que aquí hacemos otra cosa. JAMÁS alucines ni inventes respuestas.
3. Si el usuario insiste en hablar de temas fuera de lugar o insiste en cosas que no ofreces, debes responder ÚNICAMENTE con esta palabra exacta: [APAGAR_BOT] y no digas nada más.
`;
}

// --- 4. EXTRACCIÓN DE DATOS (CON CACHÉ EN RAM) ---
async function fetchCompanyData() {
    // Si los datos tienen menos de 5 minutos, leemos de la RAM al instante
    if (Date.now() - companyDataCache.lastFetch < CACHE_TTL && companyDataCache.rules) {
        console.log("⚡ Leyendo datos desde la Caché en RAM...");
        return companyDataCache;
    }

    try {
        console.log("🔄 Descargando datos frescos desde Google...");
        const credentials = JSON.parse(GOOGLE_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: credentials.client_email, private_key: credentials.private_key },
            scopes: ['https://www.googleapis.com/auth/documents.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly']
        });

        const docs = google.docs({ version: 'v1', auth });
        const sheets = google.sheets({ version: 'v4', auth });

        const docResult = await docs.documents.get({ documentId: DOC_ID });
        const docText = docResult.data.body.content
            .map(element => element.paragraph?.elements.map(e => e.textRun?.content).join('') || '')
            .join('');

        const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const firstSheetName = sheetInfo.data.sheets[0].properties.title;
        const sheetResult = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${firstSheetName}!A:Z` });
        const sheetText = (sheetResult.data.values || []).map(row => row.join(' | ')).join('\n');

        // Guardamos en la RAM para los próximos 5 minutos
        companyDataCache = { rules: docText, inventory: sheetText, lastFetch: Date.now() };
        return companyDataCache;

    } catch (error) {
        console.error("❌ Error leyendo Google:", error.message);
        return { rules: "Error", inventory: "Error" };
    }
}

// --- 5. FUNCIÓN PARA ENVIAR WHATSAPP ---
async function sendGreenApiMessage(chatId, text) {
    const url = `${GREEN_API_URL}/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`;
    try {
        await axios.post(url, { chatId: chatId, message: text });
    } catch (e) {
        console.error("❌ Error enviando mensaje:", e.message);
    }
}

// --- 6. EL NÚCLEO: RECEPCIÓN Y LÓGICA (WEBHOOK) ---
app.post('/webhook', async (req, res) => {
    res.status(200).send('OK');

    try {
        const body = req.body;
        const chatId = body.senderData?.chatId;
        
        if (!chatId || chatId.includes('@g.us') || chatId === 'status@broadcast') return;

        // 🧠 6.1. Inicializar la memoria del cliente si es nuevo
        if (!memoryCache.has(chatId)) {
            memoryCache.set(chatId, { history: [], isSilenced: false, silenceTimeout: null, messageBuffer: [], bufferTimer: null });
        }
        const userMemory = memoryCache.get(chatId);

        // 👻 6.2. MODO FANTASMA (HANDOFF AUTOMÁTICO)
        if (body.typeWebhook === 'outgoingMessageReceived') {
            console.log(`🤫 Silenciando bot para ${chatId} por 1 hora.`);
            userMemory.isSilenced = true;
            
            if (userMemory.silenceTimeout) clearTimeout(userMemory.silenceTimeout);
            userMemory.silenceTimeout = setTimeout(() => {
                userMemory.isSilenced = false;
                console.log(`🤖 Bot reactivado para ${chatId}.`);
            }, 60 * 60 * 1000); // 1 Hora silenciado
            return;
        }

        if (body.typeWebhook !== 'incomingMessageReceived' || userMemory.isSilenced) return;

        // 🛡️ 6.3. ESCUDO ANTI-MULTIMEDIA
        const type = body.messageData.typeMessage;
        if (['imageMessage', 'audioMessage', 'videoMessage', 'documentMessage', 'stickerMessage'].includes(type)) {
            await sendGreenApiMessage(chatId, "🤖 Aún soy un asistente en entrenamiento basado en texto. Por favor, escríbeme tu consulta.");
            return;
        }

        // Extraer texto
        let userText = "";
        if (type === 'textMessage') userText = body.messageData.textMessageData.textMessage;
        else if (type === 'extendedTextMessage') userText = body.messageData.extendedTextMessageData.text;

        if (!userText) return;

        // ⏱️ 6.4. ANTI-METRALLETA (BUFFER DE 8 SEGUNDOS)
        userMemory.messageBuffer.push(userText);
        
        if (userMemory.bufferTimer) clearTimeout(userMemory.bufferTimer);

        userMemory.bufferTimer = setTimeout(async () => {
            const combinedText = userMemory.messageBuffer.join('\n');
            userMemory.messageBuffer = []; 
            
            console.log(`💬 Procesando bloque para ${chatId}: ${combinedText}`);

            userMemory.history.push({ role: "user", parts: [{ text: combinedText }] });

            const companyData = await fetchCompanyData();
            const systemPrompt = buildSystemPrompt(companyData.rules, companyData.inventory);

            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash", 
                systemInstruction: systemPrompt 
            });

            const chat = model.startChat({ history: userMemory.history.slice(0, -1) });
            const result = await chat.sendMessage(combinedText);
            const botReply = result.response.text();

            // 🛑 6.5 APAGADO AUTOMÁTICO POR INSISTENCIA (FUERA DE TEMA)
            if (botReply.includes('[APAGAR_BOT]')) {
                console.log(`🛑 Cliente insistente. Apagando bot para ${chatId} por 1 hora.`);
                userMemory.isSilenced = true;
                if (userMemory.silenceTimeout) clearTimeout(userMemory.silenceTimeout);
                userMemory.silenceTimeout = setTimeout(() => {
                    userMemory.isSilenced = false;
                }, 60 * 60 * 1000);
                
                await sendGreenApiMessage(chatId, "El asistente virtual se ha pausado. En breve un humano revisará tu caso.");
                return; // Cortamos la ejecución para no guardar esto en el historial
            }

            userMemory.history.push({ role: "model", parts: [{ text: botReply }] });
            
            if (userMemory.history.length > 10) userMemory.history = userMemory.history.slice(userMemory.history.length - 10);

            await sendGreenApiMessage(chatId, botReply);

        }, 8000); // 8 segundos

    } catch (error) {
        console.error("❌ Error General:", error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));

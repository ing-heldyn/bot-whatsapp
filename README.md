# Agente de Ventas con IA para WhatsApp

¡Bienvenido! Este es el código oficial del tutorial de YouTube para crear tu propio **Agente de Ventas con Inteligencia Artificial** en 5 minutos.

Este bot es un "Camaleón" porque cambia de personalidad, reglas e inventario sin tocar una sola línea de código. Usa **Gemini AI** como cerebro, lee tus reglas desde **Google Docs**, consulta tus precios/stock en tiempo real desde **Google Sheets** y se conecta a tu número usando **Green API**.

---

## 🎁 Plantillas de Regalo Incluidas
En este repositorio encontrarás los archivos base para que no empieces desde cero:
*   **`bot-whatsapp.docx`**: Plantilla para tus reglas de negocio.
*   **`bot-whatsapp.xlsx`**: Plantilla para tu inventario y catálogo.

---

## 🚀 Pasos para la Instalación Rápida (Nivel: Copiar y Pegar)

1.  **Descarga este código:** Haz clic en el botón verde **"Code"** -> **"Download ZIP"** y descomprímelo en tu PC.
2.  **Súbelo a tu propio GitHub:** Crea un repositorio nuevo (en **Privado**) en tu cuenta y arrastra los archivos `index.js` y `package.json`.
3.  **Despliega en Railway:** Entra a [Railway.app](https://railway.app), dale a "Deploy from GitHub repo" y selecciona tu repositorio.
4.  **Configura las Variables Maestras:** En la pestaña **"Variables"** de Railway, agrega estas **7 exactas**:

| Variable | Descripción |
| :--- | :--- |
| `GREEN_API_URL` | La URL base de tu instancia. **DEBE incluir `https://`** (Ej: `https://7107.api.greenapi.com`). |
| `ID_INSTANCE` | El número de identificación de tu Green API. |
| `API_TOKEN_INSTANCE` | El token largo de tu cuenta de Green API. |
| `GEMINI_API_KEY` | Tu llave generada en Google AI Studio. |
| `DOC_ID` | El código largo del link de tu Google Docs (Reglas). |
| `SHEET_ID` | El código largo del link de tu Google Sheets (Inventario). |
| `GOOGLE_CREDENTIALS` | TODO el texto (con llaves `{ }`) de tu archivo JSON de Google Cloud. |

5.  **Conecta el Webhook:** Copia la URL pública que te da Railway, ve a la sección **"Webhooks"** en Green API y pégala siguiendo estas reglas:
    *   Debe empezar con **`https://`**.
    *   Debe terminar con **`/webhook`**.
    *   *Ejemplo:* `https://tu-app-production.up.railway.app/webhook`

---

## 💼 Fase de Pruebas vs. Negocio Real

Este tutorial usa las **capas gratuitas** de todas las plataformas. Si vas a usar este bot para atender clientes reales 24/7, los costos de mantenimiento son mínimos:
*   **Servidor (Railway):** (para que nunca se apague).
*   **WhatsApp (Green API):** Licencia "Production" para chats ilimitados.
*   **Cerebro (Gemini API):** Pago por uso (centavos de dólar al mes para una Pyme).

*¡Por menos de lo que cuesta una cena, tienes un empleado estrella trabajando día y noche!*

---

## 🔗 Enlaces útiles:
- [Green API (WhatsApp)](https://green-api.com/)
- [Google AI Studio (Gemini Key)](https://aistudio.google.com/)
- [Google Cloud Console (Credenciales)](https://console.cloud.google.com/)

---
*Desarrollado para la comunidad de YouTube. Si necesitas una solución corporativa personalizada (API Oficial de Meta, CRM, etc.), contáctame en mis redes.*

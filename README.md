# 🦎 Agente IA Camaleón para WhatsApp

¡Bienvenido! Este es el código oficial del tutorial de YouTube para crear tu propio Agente de Ventas con Inteligencia Artificial en 5 minutos.

Este bot usa **Gemini AI** como cerebro, lee tus reglas desde **Google Docs**, consulta tus precios desde **Google Sheets** y se conecta a tu número real usando **Green API**.

## 🚀 Pasos para la instalación rápida:

1. **Descarga este código:** Clic en el botón verde "Code" -> "Download ZIP".
2. **Súbelo a tu GitHub:** Crea un repositorio privado en tu cuenta y arrastra los archivos `index.js` y `package.json`.
3. **Despliega en Railway:** Entra a Railway.app, dale a "Deploy from GitHub" y selecciona tu repositorio.
4. **Configura las Variables:** En Railway, ve a la pestaña "Variables" y agrega estas 6 exactas:
   - `GEMINI_API_KEY`: Tu llave de Google AI Studio.
   - `ID_INSTANCE`: De tu cuenta gratuita de Green API.
   - `API_TOKEN_INSTANCE`: De tu cuenta de Green API.
   - `DOC_ID`: El código largo del link de tu Google Doc (Reglas).
   - `SHEET_ID`: El código largo del link de tu Google Sheet (Inventario).
   - `GOOGLE_CREDENTIALS`: Todo el texto de tu archivo JSON de Google Cloud.

## 🔗 Enlaces útiles mencionados en el video:
- [Green API (Para conectar WhatsApp gratis)](https://green-api.com/)
- [Google AI Studio (Para sacar la llave de Gemini)](https://aistudio.google.com/)

---
*Desarrollado para la comunidad de YouTube. Si necesitas una Arquitectura Enterprise para tu empresa, contáctame en mis redes.*
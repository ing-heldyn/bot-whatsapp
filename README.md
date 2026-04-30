# 🦎 Agente IA Camaleón para WhatsApp

¡Bienvenido! Este es el código oficial del tutorial de YouTube para crear tu propio Agente de Ventas con Inteligencia Artificial en 5 minutos.

Este bot es un "Camaleón" porque cambia de personalidad e inventario sin tocar código. Usa **Gemini AI** como cerebro, lee tus reglas desde **Google Docs**, consulta tus precios/stock en tiempo real desde **Google Sheets** y se conecta a tu número usando **Green API**.

---

## 🚀 Pasos para la Instalación Rápida (Nivel: Copiar y Pegar)

1. **Descarga este código:** Haz clic en el botón verde "Code" -> "Download ZIP" y descomprímelo en tu PC.
2. **Súbelo a tu propio GitHub:** Crea un repositorio nuevo (en Privado) en tu cuenta y arrastra los archivos `index.js` y `package.json`.
3. **Despliega en Railway:** Entra a Railway.app, dale a "Deploy from GitHub repo" y selecciona el repositorio que acabas de crear.
4. **Configura las Variables Maestras:** En tu proyecto de Railway, ve a la pestaña "Variables" y agrega estas **7 exactas**:

   * `GREEN_API_URL`: La URL base de tu instancia (Ej. *https://7107.api.greenapi.com*).
   * `ID_INSTANCE`: El número de identificación de tu Green API.
   * `API_TOKEN_INSTANCE`: El token largo de tu Green API.
   * `GEMINI_API_KEY`: Tu llave generada en Google AI Studio.
   * `DOC_ID`: El código largo del link de tu documento de Google Docs (Tus reglas).
   * `SHEET_ID`: El código largo del link de tu Google Sheets (Tu inventario).
   * `GOOGLE_CREDENTIALS`: TODO el texto (con llaves incluidas) de tu archivo JSON de Google Cloud.

5. **Conecta el Webhook:** Copia la URL pública que te da Railway, ve a la sección "Webhooks" en Green API y pégala asegurándote de agregar `/webhook` al final (Ej. *https://tu-app.up.railway.app/webhook*).

---

## 💼 Fase de Pruebas vs. Negocio Real

Este tutorial está diseñado usando las **capas gratuitas** de todas las plataformas para que puedas aprender y probar sin gastar un centavo. 

**Si vas a usar este bot para atender a los clientes reales de tu negocio 24/7**, los costos para mantener esta infraestructura profesional son mínimos:
* **El Servidor (Railway):** Desde ~$5 USD al mes para mantener el cerebro encendido siempre.
* **La Conexión a WhatsApp (Green API):** Una licencia "Production" cuesta alrededor de $20 - $25 USD mensuales para chatear con clientes ilimitados.
* **El Cerebro (Gemini API):** Google cobra fracciones de centavo por cada mil palabras. Un uso normal de Pyme no suele pasar de un par de dólares al mes.

*¡Por menos de lo que cuesta una cena, tienes un empleado estrella trabajando día y noche!*

---

## 🔗 Enlaces útiles mencionados en el video:
- [Green API (Para conectar WhatsApp)](https://green-api.com/)
- [Google AI Studio (Para sacar la llave de Gemini)](https://aistudio.google.com/)
- [Google Cloud Console (Para las credenciales de lectura)](https://console.cloud.google.com/)

---
*Desarrollado para la comunidad. Si eres dueño de un negocio que procesa cientos de mensajes y necesitas una Arquitectura Enterprise (API Oficial de Meta, conexión a CRMs y supervisión humana), contáctame en mis redes para que mi agencia lo construya por ti.*

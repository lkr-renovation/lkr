/**
 * LKR ADMIN PANEL - API TRADUZIONE GROQ
 * Vercel Serverless Function
 * 
 * Endpoint: POST /api/translate
 * Body: { text: "testo italiano", targetLang: "fr" }
 * Response: { translation: "texte français" }
 */

export default async function handler(req, res) {
  // CORS headers per permettere chiamate dal frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gestione preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Accetta solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLang } = req.body;

    // Validazione input
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing text or targetLang' });
    }

    // Verifica che API key sia configurata
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured in Vercel' });
    }

    // Mapping lingue
    const languageNames = {
      fr: 'francese (Francia)',
      en: 'inglese',
      de: 'tedesco',
      ru: 'russo',
      es: 'spagnolo'
    };

    const langName = languageNames[targetLang];
    if (!langName) {
      return res.status(400).json({ error: `Unsupported language: ${targetLang}` });
    }

    // Chiamata Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Sei un traduttore professionale specializzato in contenuti per l'industria del lusso e della ristrutturazione. 
                      Traduci il testo in ${langName} mantenendo:
                      - Tono elegante e professionale
                      - Terminologia del settore edile/ristrutturazione
                      - Stile adatto a clientela alta gamma Monaco/Costa Azzurra
                      - Lunghezza simile all'originale
                      
                      Rispondi SOLO con la traduzione, senza commenti o spiegazioni.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return res.status(response.status).json({ 
        error: `Groq API error: ${error.error?.message || 'Unknown error'}` 
      });
    }

    const data = await response.json();
    const translation = data.choices[0].message.content.trim();

    // Ritorna traduzione
    return res.status(200).json({ 
      translation,
      targetLang 
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

/**
 * LKR ADMIN PANEL - CONFIGURAZIONE
 * 
 * ⚠️ IMPORTANTE: Questo file NON deve essere committato su GitHub!
 * È protetto da .gitignore per sicurezza.
 * 
 * Compila i valori qui sotto con le tue credenziali.
 */

const LKR_CONFIG = {
  
  // Password admin panel (hash SHA-256)
  // Password: "lkradmin"
  adminPasswordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
  
  // Groq API (per traduzioni automatiche)
  // Ottieni la tua key gratuita su: https://console.groq.com/keys
  groqApiKey: "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",
  
  // GitHub Personal Access Token (per auto-commit)
  // Deve avere permessi: repo (full control)
  // Usa lo stesso token di n8n se lo hai già
  githubToken: "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",
  
  // Repository GitHub
  githubOwner: "lkr-renovation",
  githubRepo: "lkr",
  githubBranch: "main",
  
  // Modello Groq per traduzioni
  // Opzioni: llama-3.3-70b-versatile (consigliato), mixtral-8x7b-32768
  groqModel: "llama-3.3-70b-versatile",
  
  // Lingue supportate (IT è master, non viene tradotto)
  languages: {
    it: "Italiano",
    fr: "Français", 
    en: "English",
    de: "Deutsch",
    ru: "Русский",
    es: "Español"
  },
  
  // Lingue target per traduzione (tutte tranne IT)
  translateTo: ["fr", "en", "de", "ru", "es"]
};

// Verifica configurazione al caricamento
(function checkConfig() {
  if (LKR_CONFIG.groqApiKey === "gsk_YOUR_GROQ_API_KEY_HERE") {
    console.warn("⚠️ Groq API key non configurata! Compila admin/config.js");
  }
  if (LKR_CONFIG.githubToken === "ghp_YOUR_GITHUB_TOKEN_HERE") {
    console.warn("⚠️ GitHub token non configurato! Compila admin/config.js");
  }
})();

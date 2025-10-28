/**
 * LKR ADMIN PANEL - SISTEMA EDITING INLINE
 * Versione 2.1 - Serverless API + Fix window.I18N
 * 
 * Funzionalità:
 * - Login con password
 * - Editing inline testi con data-i18n
 * - Traduzione automatica tramite /api/translate
 * - Salvataggio su GitHub tramite /api/github
 * - Preview modifiche in tempo reale
 * 
 * SICUREZZA: API keys protette lato server (Vercel Environment Variables)
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURAZIONE
  // ============================================
  
  const LKR_CONFIG = {
    adminPasswordHash: "21bc62c695e168a7576b91e2965bc1a34f8def2b5fb55b0adbe50e1065863600",
    
    // Endpoint API (Vercel Serverless Functions)
    apiTranslate: '/api/translate',
    apiGithub: '/api/github',
    
    // Lingue supportate
    languages: {
      it: "Italiano",
      fr: "Français", 
      en: "English",
      de: "Deutsch",
      ru: "Русский",
      es: "Español"
    },
    
    translateTo: ["fr", "en", "de", "ru", "es"]
  };

  // ============================================
  // STATO GLOBALE
  // ============================================
  
  const LKR_ADMIN = {
    isLoggedIn: false,
    isEditMode: false,
    currentEditingElement: null,
    currentI18nKey: null,
    originalI18N: null,
    modifiedI18N: null,
    currentPage: window.location.pathname
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `lkr-notification ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    notification.innerHTML = `
      <div class="lkr-notification-icon">${icons[type]}</div>
      <div class="lkr-notification-content">
        <div class="lkr-notification-title">${title}</div>
        <div class="lkr-notification-message">${message}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  function getI18nValue(lang, key) {
    const keys = key.split('.');
    let value = window.I18N[lang];
    
    for (const k of keys) {
      if (value === undefined) return null;
      value = value[k];
    }
    
    return value;
  }

  function setI18nValue(lang, key, newValue) {
    const keys = key.split('.');
    let obj = LKR_ADMIN.modifiedI18N[lang];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = newValue;
  }

  // ============================================
  // LOGIN SYSTEM
  // ============================================

  function showLoginModal() {
    console.log('🔵 showLoginModal chiamata');
    const modal = document.createElement('div');
    modal.id = 'lkr-admin-login-modal';
    modal.innerHTML = `
        <div class="lkr-admin-login-box">
          <button id="lkr-admin-close-modal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d;">&times;</button>
        <h2>🔐 LKR Admin Panel</h2>
        <input type="password" id="lkr-admin-password" placeholder="Password" autocomplete="off">
        <button id="lkr-admin-login-btn">Accedi</button>
        <div class="lkr-admin-error" id="lkr-admin-error"></div>
      </div>
    `;
    
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('lkr-admin-close-modal');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
    console.log('🔵 Modal aggiunta al DOM');
    
    const input = document.getElementById('lkr-admin-password');
    const btn = document.getElementById('lkr-admin-login-btn');
    const error = document.getElementById('lkr-admin-error');
    
    input.focus();
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') btn.click();
    });
    
    btn.addEventListener('click', async () => {
      console.log('🔵 Click bottone Accedi');
      const password = input.value.trim();
      console.log('🔵 Password inserita');
      
      const hash = await sha256(password);
      console.log('🔵 Hash calcolato:', hash);
      console.log('🔵 Hash atteso:', LKR_CONFIG.adminPasswordHash);
      console.log('🔵 Match:', hash === LKR_CONFIG.adminPasswordHash);
      
      if (hash === LKR_CONFIG.adminPasswordHash) {
        console.log('🟢 Password corretta!');
        sessionStorage.setItem('lkr-admin-session', LKR_CONFIG.adminPasswordHash);
        console.log('🟢 Sessione salvata');
        LKR_ADMIN.isLoggedIn = true;
        console.log('🟢 isLoggedIn = true');
        modal.remove();
        console.log('🟢 Modal rimossa');
        console.log('🟢 Chiamo initAdminMode...');
        initAdminMode();
        console.log('🟢 initAdminMode completata');
        showNotification('Login effettuato', 'Modalità editing attivata', 'success');
      } else {
        console.log('🔴 Password errata');
        error.textContent = 'Password errata';
        input.value = '';
        input.focus();
      }
    });
  }

  function checkExistingSession() {
    console.log('🔵 checkExistingSession chiamata');
    const session = sessionStorage.getItem('lkr-admin-session');
    console.log('🔵 Sessione trovata:', session);
    console.log('🔵 Hash atteso:', LKR_CONFIG.adminPasswordHash);
    if (session === LKR_CONFIG.adminPasswordHash) {
      console.log('🟢 Sessione valida');
      LKR_ADMIN.isLoggedIn = true;
      return true;
    }
    console.log('🔴 Sessione non valida');
    return false;
  }

  function logout() {
    console.log('🔵 Logout chiamato');
    
    // Pulisci TUTTO
    sessionStorage.removeItem('lkr-admin-session');
    LKR_ADMIN.isLoggedIn = false;
    LKR_ADMIN.isEditMode = false;
    LKR_ADMIN.currentEditingElement = null;
    LKR_ADMIN.currentI18nKey = null;
    
    // Rimuovi classi editable e listener
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.classList.remove('lkr-editable');
      el.classList.remove('editing');
      // Rimuovi il listener se esiste
      if (el.lkrClickListener) {
        el.removeEventListener('click', el.lkrClickListener);
        el.lkrClickListener = null;
      }
    });
    
    // Chiudi sidebar se aperta
    closeSidebar();
    
    // Rimuovi sidebar
    const sidebar = document.getElementById('lkr-admin-sidebar');
    if (sidebar) sidebar.remove();
    
    // Rimuovi overlay
    const overlay = document.getElementById('lkr-admin-overlay');
    if (overlay) overlay.remove();
    
    // Rimuovi bottone pubblica
    const publishBtn = document.getElementById('lkr-publish-btn');
    if (publishBtn) publishBtn.remove();
    
    // Reset bottone toggle
    // La logica di visualizzazione del bottone Portfolio è stata spostata in admin-portfolio.js.
    // Il bottone si nasconderà automaticamente al prossimo ricaricamento della pagina.
    const toggleBtn = document.getElementById('lkr-admin-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = '🔧 Admin';
      toggleBtn.classList.remove('active');
    }
    
    showNotification('Logout effettuato', 'Modalità editing disattivata', 'info');
    
    console.log('🟢 Logout completato');
  }

  // ============================================
  // EDIT MODE
  // ============================================

  function initAdminMode() {
    console.log('🔵 initAdminMode chiamata');
    
    // Verifica che I18N esista
    if (!window.I18N) {
      console.error('❌ window.I18N non trovato!');
      showNotification('Errore', 'Dizionario I18N non ancora caricato. Riprova tra un momento.', 'error');
      
      // Riprova dopo 1 secondo
      setTimeout(() => {
        if (window.I18N) {
          console.log('🟢 window.I18N ora disponibile, riprovo...');
          initAdminMode();
        } else {
          console.error('❌ window.I18N ancora non disponibile dopo 1 secondo');
          showNotification('Errore', 'Impossibile caricare il dizionario I18N. Verifica che la pagina sia compatibile.', 'error');
          logout();
        }
      }, 1000);
      return;
    }
    
    console.log('🟢 window.I18N trovato:', Object.keys(window.I18N));
    
    LKR_ADMIN.originalI18N = JSON.parse(JSON.stringify(window.I18N));
    LKR_ADMIN.modifiedI18N = JSON.parse(JSON.stringify(window.I18N));
    
    const toggleBtn = document.getElementById('lkr-admin-toggle');
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      
      // Visualizzazione immediata del bottone Portfolio dopo il login (solo se siamo in portfolio.html)
      if (window.location.pathname.includes('portfolio')) {
        const portfolioBtn = document.getElementById('lkr-portfolio-admin-btn');
        if (portfolioBtn) {
          portfolioBtn.style.display = 'flex';
          console.log('🟢 Bottone Portfolio reso visibile da admin.js dopo il login.');
        } else {
          console.error('🔴 Bottone Portfolio non trovato in initAdminMode di admin.js.');
        }
      }
      toggleBtn.textContent = '✅ Admin ON';
    }
    
    console.log('🟢 Chiamo enableEditMode');
    enableEditMode();
  }

  function enableEditMode() {
    console.log('🔵 enableEditMode chiamata');
    LKR_ADMIN.isEditMode = true;
    
    const editableElements = document.querySelectorAll('[data-i18n]');
    console.log('🔵 Elementi con data-i18n trovati:', editableElements.length);
    
    if (editableElements.length === 0) {
      console.warn('⚠️ Nessun elemento editabile trovato!');
      showNotification('Attenzione', 'Nessun elemento editabile trovato in questa pagina', 'warning');
      return;
    }
    
    editableElements.forEach(element => {
      element.classList.add('lkr-editable');
      
      // Salva il listener per poterlo rimuovere al logout
      const clickListener = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditSidebar(element);
      };
      
      element.addEventListener('click', clickListener);
      element.lkrClickListener = clickListener; // Salva il riferimento al listener
    });
    
    showNotification('Edit Mode ON', `${editableElements.length} elementi editabili trovati`, 'success');
  }

  function disableEditMode() {
    LKR_ADMIN.isEditMode = false;
    
    document.querySelectorAll('.lkr-editable').forEach(el => {
      el.classList.remove('lkr-editable');
    });
  }

  // ============================================
  // SIDEBAR EDITING
  // ============================================

  function openEditSidebar(element) {
    const i18nKey = element.getAttribute('data-i18n');
    const currentValue = getI18nValue('it', i18nKey);
    
    LKR_ADMIN.currentEditingElement = element;
    LKR_ADMIN.currentI18nKey = i18nKey;
    
    document.querySelectorAll('.lkr-editable').forEach(el => {
      el.classList.remove('editing');
    });
    element.classList.add('editing');
    
    let sidebar = document.getElementById('lkr-admin-sidebar');
    if (!sidebar) {
      sidebar = createSidebar();
    }
    
    updateSidebarContent(i18nKey, currentValue);
    
    sidebar.classList.add('open');
    
    let overlay = document.getElementById('lkr-admin-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lkr-admin-overlay';
      overlay.addEventListener('click', closeSidebar);
      document.body.appendChild(overlay);
    }
    overlay.classList.add('visible');
  }

  function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'lkr-admin-sidebar';
    sidebar.innerHTML = `
      <div class="lkr-sidebar-header">
        <h3>✏️ Modifica Testo</h3>
        <button class="lkr-sidebar-close" id="lkr-sidebar-close">✕</button>
      </div>
      <div class="lkr-sidebar-content" id="lkr-sidebar-content">
        <!-- Contenuto dinamico -->
      </div>
      <div class="lkr-sidebar-footer">
        <button class="lkr-btn-cancel" id="lkr-btn-cancel">Annulla</button>
        <button class="lkr-btn-translate" id="lkr-btn-translate">🌍 Traduci</button>
        <button class="lkr-btn-save" id="lkr-btn-save">💾 Salva</button>
      </div>
    `;
    
    document.body.appendChild(sidebar);
    
    document.getElementById('lkr-sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('lkr-btn-cancel').addEventListener('click', closeSidebar);
    document.getElementById('lkr-btn-translate').addEventListener('click', translateCurrentText);
    document.getElementById('lkr-btn-save').addEventListener('click', saveChanges);
    
    return sidebar;
  }

  function updateSidebarContent(i18nKey, currentValue) {
    const content = document.getElementById('lkr-sidebar-content');
    
    let html = `
      <div class="lkr-sidebar-section">
        <label>🇮🇹 ITALIANO (Master)</label>
        <textarea id="lkr-edit-it" rows="4">${currentValue || ''}</textarea>
        <small style="color: #6c757d; font-size: 0.85rem; display: block; margin-top: 8px;">
          Chiave: <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${i18nKey}</code>
        </small>
      </div>
      
      <div class="lkr-sidebar-section">
        <label>🌍 TRADUZIONI</label>
        <small style="color: #6c757d; font-size: 0.85rem; display: block; margin-bottom: 12px;">
          Click su "Traduci" per generare automaticamente tutte le traduzioni
        </small>
        <div class="lkr-translation-grid">
    `;
    
    const languages = [
      { code: 'fr', flag: '🇫🇷', name: 'Français' },
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
      { code: 'ru', flag: '🇷🇺', name: 'Русский' },
      { code: 'es', flag: '🇪🇸', name: 'Español' }
    ];
    
    languages.forEach(lang => {
      const value = getI18nValue(lang.code, i18nKey) || '';
      html += `
        <div class="lkr-translation-item">
          <label>
            <span class="lang-flag">${lang.flag}</span>
            <span>${lang.name}</span>
          </label>
          <textarea id="lkr-edit-${lang.code}" rows="3">${value}</textarea>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    content.innerHTML = html;
  }

  function closeSidebar() {
    const sidebar = document.getElementById('lkr-admin-sidebar');
    const overlay = document.getElementById('lkr-admin-overlay');
    
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    
    if (LKR_ADMIN.currentEditingElement) {
      LKR_ADMIN.currentEditingElement.classList.remove('editing');
    }
    
    LKR_ADMIN.currentEditingElement = null;
    LKR_ADMIN.currentI18nKey = null;
  }

  // ============================================
  // TRADUZIONE AUTOMATICA (VIA API SERVERLESS)
  // ============================================

  async function translateCurrentText() {
    const textIT = document.getElementById('lkr-edit-it').value.trim();
    
    if (!textIT) {
      showNotification('Errore', 'Inserisci prima il testo italiano', 'error');
      return;
    }
    
    const translateBtn = document.getElementById('lkr-btn-translate');
    translateBtn.disabled = true;
    translateBtn.innerHTML = '<span class="lkr-loading"></span> Traduzione...';
    
    try {
      const translations = await translateWithAPI(textIT);
      
      Object.keys(translations).forEach(lang => {
        const textarea = document.getElementById(`lkr-edit-${lang}`);
        if (textarea) {
          textarea.value = translations[lang];
        }
      });
      
      showNotification('Traduzione completata', 'Tutte le lingue sono state tradotte', 'success');
      
    } catch (error) {
      console.error('Errore traduzione:', error);
      showNotification('Errore traduzione', error.message, 'error');
    } finally {
      translateBtn.disabled = false;
      translateBtn.innerHTML = '🌍 Traduci';
    }
  }

  /**
   * Chiama API serverless /api/translate
   */
  async function translateWithAPI(textIT) {
    const translations = {};
    const targetLanguages = ['fr', 'en', 'de', 'ru', 'es'];
    
    for (const lang of targetLanguages) {
      const response = await fetch(LKR_CONFIG.apiTranslate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textIT,
          targetLang: lang
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Translation API error: ${response.status}`);
      }
      
      const data = await response.json();
      translations[lang] = data.translation;
    }
    
    return translations;
  }

  // ============================================
  // SALVATAGGIO MODIFICHE
  // ============================================

  async function saveChanges() {
    const i18nKey = LKR_ADMIN.currentI18nKey;
    
    const newValues = {
      it: document.getElementById('lkr-edit-it').value.trim(),
      fr: document.getElementById('lkr-edit-fr').value.trim(),
      en: document.getElementById('lkr-edit-en').value.trim(),
      de: document.getElementById('lkr-edit-de').value.trim(),
      ru: document.getElementById('lkr-edit-ru').value.trim(),
      es: document.getElementById('lkr-edit-es').value.trim()
    };
    
    if (!newValues.it) {
      showNotification('Errore', 'Il testo italiano è obbligatorio', 'error');
      return;
    }
    
    Object.keys(newValues).forEach(lang => {
      setI18nValue(lang, i18nKey, newValues[lang]);
      
      const keys = i18nKey.split('.');
      let obj = window.I18N[lang];
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = newValues[lang];
    });
    
    updatePageVisuals();
    closeSidebar();
    
    showNotification('Modifiche salvate', 'Le modifiche sono visibili nella pagina. Clicca "Pubblica su GitHub" per rendere definitive.', 'success');
    
    showPublishButton();
  }

  function updatePageVisuals() {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'fr';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const newValue = getI18nValue(currentLang, key);
      if (newValue && typeof newValue === 'string') {
        el.textContent = newValue;
      }
    });
  }

  function showPublishButton() {
    let publishBtn = document.getElementById('lkr-publish-btn');
    
    if (!publishBtn) {
      publishBtn = document.createElement('button');
      publishBtn.id = 'lkr-publish-btn';
      publishBtn.innerHTML = '🚀 Pubblica su GitHub';
      publishBtn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        background: linear-gradient(135deg, #28a745, #218838);
        color: white;
        border: none;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(40, 167, 69, 0.4);
        transition: all 0.3s;
      `;
      
      publishBtn.addEventListener('click', publishToGitHub);
      publishBtn.addEventListener('mouseenter', () => {
        publishBtn.style.transform = 'translateY(-4px)';
        publishBtn.style.boxShadow = '0 12px 32px rgba(40, 167, 69, 0.5)';
      });
      publishBtn.addEventListener('mouseleave', () => {
        publishBtn.style.transform = 'translateY(0)';
        publishBtn.style.boxShadow = '0 8px 24px rgba(40, 167, 69, 0.4)';
      });
      
      document.body.appendChild(publishBtn);
    }
  }

  async function publishToGitHub() {
    if (!confirm('Confermi la pubblicazione delle modifiche su GitHub?\n\nIl sito verrà aggiornato automaticamente via Vercel.')) {
      return;
    }
    
    const publishBtn = document.getElementById('lkr-publish-btn');
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<span class="lkr-loading"></span> Pubblicazione...';
    
    try {
      showNotification('Pubblicazione', 'Preparazione commit...', 'info');
      
      const filePath = LKR_ADMIN.currentPage === '/' ? 'index.html' : LKR_ADMIN.currentPage.replace(/^\//, '');
      
      const currentFile = await getFileFromGitHub(filePath);
      const updatedFile = replaceI18NInFile(currentFile, LKR_ADMIN.modifiedI18N);
      
      await commitToGitHub(filePath, updatedFile, 'Admin panel: aggiornamento testi i18n');
      
      showNotification('Pubblicazione completata', 'Modifiche pubblicate su GitHub. Vercel aggiornerà il sito automaticamente.', 'success');
      
      publishBtn.remove();
      
    } catch (error) {
      console.error('Errore pubblicazione:', error);
      showNotification('Errore pubblicazione', error.message, 'error');
      publishBtn.disabled = false;
      publishBtn.innerHTML = '🚀 Pubblica su GitHub';
    }
  }

  // ============================================
  // GITHUB API (VIA SERVERLESS)
  // ============================================

  async function getFileFromGitHub(filePath) {
    const response = await fetch(LKR_CONFIG.apiGithub, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'getFile',
        filePath: filePath
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  }

  function replaceI18NInFile(fileData, newI18N) {
    let content = fileData.content;
    
    const startMarker = 'window.I18N = {';
    let startIndex = content.indexOf(startMarker);
    
    // Se non trova window.I18N, cerca const I18N
    if (startIndex === -1) {
      const altMarker = 'const I18N = {';
      startIndex = content.indexOf(altMarker);
      if (startIndex === -1) {
        throw new Error('Dizionario I18N non trovato nel file');
      }
    }
    
    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let stringChar = '';
    
    const searchStart = content.indexOf('{', startIndex);
    
    for (let i = searchStart; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        
        if (braceCount === 0 && char === '}') {
          endIndex = i + 1;
          if (content[i + 1] === ';') {
            endIndex = i + 2;
          }
          break;
        }
      }
    }
    
    if (endIndex === -1) {
      throw new Error('Fine dizionario I18N non trovata');
    }
    
    const newI18NString = 'window.I18N = ' + JSON.stringify(newI18N, null, 2) + ';';
    const newContent = content.substring(0, startIndex) + newI18NString + content.substring(endIndex);
    
    return {
      content: newContent,
      sha: fileData.sha
    };
  }

  async function commitToGitHub(filePath, fileData, message) {
    const response = await fetch(LKR_CONFIG.apiGithub, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'commit',
        filePath: filePath,
        content: fileData.content,
        sha: fileData.sha,
        message: message
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `GitHub commit error: ${response.status}`);
    }
    
    return await response.json();
  }

  // ============================================
  // INIZIALIZZAZIONE
  // ============================================

  function createAdminToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'lkr-admin-toggle';
    toggleBtn.innerHTML = '🔧 Admin';
    
    toggleBtn.addEventListener('click', () => {
      if (!LKR_ADMIN.isLoggedIn) {
        showLoginModal();
      } else {
        if (LKR_ADMIN.isEditMode) {
          if (confirm('Disattivare modalità editing?\n\nLe modifiche non salvate andranno perse.')) {
            logout();
          }
        } else {
          initAdminMode();
        }
      }
    });
    
    document.body.appendChild(toggleBtn);
  }

  function init() {
    console.log('🔵 Admin init chiamata');
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/admin/admin.css';
    document.head.appendChild(link);
    
    createAdminToggle();
    
    // Aspetta che I18N sia disponibile prima di controllare sessione
    const checkI18N = setInterval(() => {
      if (window.I18N) {
        console.log('🟢 window.I18N disponibile');
        clearInterval(checkI18N);
        if (checkExistingSession()) {
          initAdminMode();
        }
      } else {
        console.log('⏳ Aspetto window.I18N...');
      }
    }, 1000);
    
    // Timeout dopo 5 secondi
    setTimeout(() => {
      clearInterval(checkI18N);
      if (!window.I18N) {
        console.warn('⚠️ window.I18N non disponibile dopo 5 secondi');
      }
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
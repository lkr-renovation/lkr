/**
 * LKR ADMIN PANEL - PORTFOLIO PROJECTS MANAGER
 * Versione 1.0
 * 
 * Gestisce CRUD progetti in /data/progetti.json:
 * - Aggiungi nuovo progetto
 * - Modifica progetto esistente (titolo, anno, luogo, descrizione, immagini)
 * - Elimina progetto
 * - Salvataggio su GitHub
 */

(function() {
  'use strict';

  // ============================================
  // STATO GLOBALE PORTFOLIO
  // ============================================
  
  const PORTFOLIO_ADMIN = {
    progetti: [],
    currentEditingProject: null,
    hasChanges: false
  };

  // ============================================
  // UTILITY
  // ============================================

  function showNotificationPortfolio(title, message, type = 'info') {
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

  // ============================================
  // CARICAMENTO PROGETTI
  // ============================================

  async function loadProgettiJSON() {
    try {
      const response = await fetch('/data/progetti.json');
      const data = await response.json();
      PORTFOLIO_ADMIN.progetti = data.progetti || [];
      return PORTFOLIO_ADMIN.progetti;
    } catch (error) {
      console.error('Errore caricamento progetti:', error);
      showNotificationPortfolio('Errore', 'Impossibile caricare progetti.json', 'error');
      return [];
    }
  }

  // ============================================
  // PANNELLO GESTIONE PORTFOLIO
  // ============================================

  async function openPortfolioManager() {
    // Verifica login
    const session = sessionStorage.getItem('lkr-admin-session');
    if (!session) {
      alert('Devi prima effettuare il login dal pannello Admin!');
      return;
    }

    // Carica progetti
    const progetti = await loadProgettiJSON();
    
	  // Inietta CSS se non presente
	  if (!document.getElementById('lkr-portfolio-css')) {
	    const link = document.createElement('link');
	    link.id = 'lkr-portfolio-css';
	    link.rel = 'stylesheet';
	    link.href = '/admin/admin-portfolio.css';
	    document.head.appendChild(link);
	  }

	  // Crea modal
    const modal = document.createElement('div');
    modal.id = 'lkr-portfolio-manager-modal';
    modal.className = 'lkr-portfolio-modal';
    
    modal.innerHTML = `
      <div class="lkr-portfolio-manager">
        <div class="lkr-portfolio-header">
          <h2>🎨 Gestione Portfolio Progetti</h2>
          <button class="lkr-portfolio-close" id="portfolio-close-btn">✕</button>
        </div>
        
        <div class="lkr-portfolio-toolbar">
          <button class="lkr-btn-add-project" id="add-project-btn">➕ Nuovo Progetto</button>
          <button class="lkr-btn-save-json" id="save-json-btn" disabled>💾 Salva Modifiche</button>
        </div>
        
        <div class="lkr-projects-list" id="projects-list">
          ${renderProjectsList(progetti)}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('portfolio-close-btn').addEventListener('click', closePortfolioManager);
    document.getElementById('add-project-btn').addEventListener('click', showAddProjectForm);
    document.getElementById('save-json-btn').addEventListener('click', saveProgettiToGitHub);
    
// Delega degli eventi per i bottoni edit/delete
    const projectsList = document.getElementById('projects-list');
    projectsList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.project-edit-btn');
        const deleteBtn = e.target.closest('.project-delete-btn');
        
        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            const projectId = editBtn.closest('.project-card-admin')?.dataset.projectId;
            editProject(projectId);
        } else if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const projectId = deleteBtn.closest('.project-card-admin')?.dataset.projectId;
            deleteProject(projectId);
        }
    });
  }

  function renderProjectsList(progetti) {
    if (progetti.length === 0) {
      return '<div class="empty-projects">Nessun progetto trovato. Clicca "Nuovo Progetto" per iniziare.</div>';
    }
    
    return progetti.map(p => `
      <div class="project-card-admin" data-project-id="${p.id}">
        <div class="project-thumb">
          <img src="${p.immagini[0]}" alt="${p.traduzioni.it.titolo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
        </div>
        <div class="project-info-admin">
          <h4>${p.traduzioni.it.titolo}</h4>
          <p><strong>Anno:</strong> ${p.anno}</p>
          <p><strong>Categoria:</strong> ${p.categoria}</p>
          <p><strong>Luogo:</strong> ${p.traduzioni.it.luogo}</p>
          <p><strong>Immagini:</strong> ${p.immagini.length}</p>
        </div>
        <div class="project-actions">
          <div class="project-actions-buttons">
            <button class="project-edit-btn">✏️ Modifica</button>
            <button class="project-delete-btn">🗑️ Elimina</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function closePortfolioManager() {
    if (PORTFOLIO_ADMIN.hasChanges) {
      if (!confirm('Hai modifiche non salvate. Vuoi davvero uscire?')) {
        return;
      }
    }
    
    const modal = document.getElementById('lkr-portfolio-manager-modal');
    if (modal) modal.remove();
  }

  // ============================================
  // AGGIUNGI/MODIFICA PROGETTO
  // ============================================

  function showAddProjectForm() {
    const form = createProjectForm(null);
    showProjectFormModal(form, 'Nuovo Progetto', saveNewProject);
  }

  function editProject(projectId) {
    const project = PORTFOLIO_ADMIN.progetti.find(p => p.id === projectId);
    if (!project) return;
    
    const form = createProjectForm(project);
    showProjectFormModal(form, 'Modifica Progetto', () => saveEditedProject(projectId));
  }

  function createProjectForm(project) {
    const data = project || {
      anno: new Date().getFullYear(),
      categoria: 'rénovation-complète',
      immagini: [],
      traduzioni: {
        fr: { titolo: '', luogo: '', descrizione: '' },
        it: { titolo: '', luogo: '', descrizione: '' },
        en: { titolo: '', luogo: '', descrizione: '' },
        ru: { titolo: '', luogo: '', descrizione: '' },
        de: { titolo: '', luogo: '', descrizione: '' },
        es: { titolo: '', luogo: '', descrizione: '' }
      }
    };
    
    return `
      <div class="project-form">
        <div class="form-group">
          <label>Anno</label>
          <input type="number" id="project-anno" value="${data.anno}" min="2020" max="2030">
        </div>
        
        <div class="form-group">
          <label>Categoria</label>
          <select id="project-categoria">
            <option value="rénovation-complète" ${data.categoria === 'rénovation-complète' ? 'selected' : ''}>Rénovation complète</option>
            <option value="rénovation-salle-de-bain" ${data.categoria === 'rénovation-salle-de-bain' ? 'selected' : ''}>Salle de bain</option>
            <option value="rénovation-cuisine" ${data.categoria === 'rénovation-cuisine' ? 'selected' : ''}>Cuisine</option>
            <option value="décoration-murale" ${data.categoria === 'décoration-murale' ? 'selected' : ''}>Décoration murale</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Immagini (una per riga, percorso completo)</label>
          <textarea id="project-immagini" rows="5" placeholder="/img/portfolio/2025/nome-progetto/img-01.jpg&#10;/img/portfolio/2025/nome-progetto/img-02.jpg">${(data.immagini || []).join('\n')}</textarea>
          <small>⚠️ Assicurati che i file esistano già caricati su GitHub</small>
        </div>
        
        <h3>🇮🇹 Italiano (Master)</h3>
        <div class="form-group">
          <label>Titolo</label>
          <input type="text" id="project-titolo-it" value="${data.traduzioni.it.titolo}">
        </div>
        <div class="form-group">
          <label>Luogo</label>
          <input type="text" id="project-luogo-it" value="${data.traduzioni.it.luogo}">
        </div>
        <div class="form-group">
          <label>Descrizione</label>
          <textarea id="project-desc-it" rows="3">${data.traduzioni.it.descrizione}</textarea>
        </div>
        
        <h3>🌍 Traduzioni</h3>
        ${['fr', 'en', 'de', 'ru', 'es'].map(lang => {
          const flags = { fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪', ru: '🇷🇺', es: '🇪🇸' };
          return `
            <details>
              <summary>${flags[lang]} ${lang.toUpperCase()}</summary>
              <div class="form-group">
                <label>Titolo</label>
                <input type="text" id="project-titolo-${lang}" value="${data.traduzioni[lang].titolo}">
              </div>
              <div class="form-group">
                <label>Luogo</label>
                <input type="text" id="project-luogo-${lang}" value="${data.traduzioni[lang].luogo}">
              </div>
              <div class="form-group">
                <label>Descrizione</label>
                <textarea id="project-desc-${lang}" rows="3">${data.traduzioni[lang].descrizione}</textarea>
              </div>
            </details>
          `;
        }).join('')}
        
        <button class="lkr-btn-translate-project" id="translate-project-btn">🌍 Traduci automaticamente da Italiano</button>
      </div>
    `;
  }

  function showProjectFormModal(formHTML, title, saveCallback) {
    const modal = document.createElement('div');
    modal.className = 'lkr-project-form-modal';
    modal.innerHTML = `
      <div class="lkr-project-form-container">
        <div class="lkr-project-form-header">
          <h3>${title}</h3>
          <button class="lkr-form-close" id="form-close-btn">✕</button>
        </div>
        <div class="lkr-project-form-body">
          ${formHTML}
        </div>
        <div class="lkr-project-form-footer">
          <button class="lkr-btn-cancel" id="form-cancel-btn">Annulla</button>
          <button class="lkr-btn-save" id="form-save-btn">💾 Salva Progetto</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('form-close-btn').addEventListener('click', () => modal.remove());
    document.getElementById('form-cancel-btn').addEventListener('click', () => modal.remove());
    document.getElementById('form-save-btn').addEventListener('click', () => {
      saveCallback();
      modal.remove();
    });
    
    document.getElementById('translate-project-btn').addEventListener('click', translateProjectFromIT);
  }

  async function translateProjectFromIT() {
    const titoloIT = document.getElementById('project-titolo-it').value.trim();
    const luogoIT = document.getElementById('project-luogo-it').value.trim();
    const descIT = document.getElementById('project-desc-it').value.trim();
    
    if (!titoloIT || !luogoIT || !descIT) {
      alert('Compila prima tutti i campi italiani!');
      return;
    }
    
    const btn = document.getElementById('translate-project-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Traduzione in corso...';
    
    try {
      for (const lang of ['fr', 'en', 'de', 'ru', 'es']) {
        const translations = await Promise.all([
          translateText(titoloIT, lang),
          translateText(luogoIT, lang),
          translateText(descIT, lang)
        ]);
        
        document.getElementById(`project-titolo-${lang}`).value = translations[0];
        document.getElementById(`project-luogo-${lang}`).value = translations[1];
        document.getElementById(`project-desc-${lang}`).value = translations[2];
      }
      
      showNotificationPortfolio('Traduzione completata', 'Tutti i campi sono stati tradotti', 'success');
    } catch (error) {
      showNotificationPortfolio('Errore traduzione', error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🌍 Traduci automaticamente da Italiano';
    }
  }

  async function translateText(text, targetLang) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang })
    });
    
    if (!response.ok) throw new Error('Errore traduzione');
    const data = await response.json();
    return data.translation;
  }

  function saveNewProject() {
    const newProject = extractProjectFromForm();
    newProject.id = `progetto-${Date.now()}`;
    
    PORTFOLIO_ADMIN.progetti.push(newProject);
    PORTFOLIO_ADMIN.hasChanges = true;
    
    refreshProjectsList();
    enableSaveButton();
    showNotificationPortfolio('Progetto aggiunto', 'Ricorda di cliccare "Salva Modifiche"', 'success');
  }

  function saveEditedProject(projectId) {
    const index = PORTFOLIO_ADMIN.progetti.findIndex(p => p.id === projectId);
    if (index === -1) return;
    
    const updatedProject = extractProjectFromForm();
    updatedProject.id = projectId;
    
    PORTFOLIO_ADMIN.progetti[index] = updatedProject;
    PORTFOLIO_ADMIN.hasChanges = true;
    
    refreshProjectsList();
    enableSaveButton();
    showNotificationPortfolio('Progetto aggiornato', 'Ricorda di cliccare "Salva Modifiche"', 'success');
  }

  function deleteProject(projectId) {
    const project = PORTFOLIO_ADMIN.progetti.find(p => p.id === projectId);
    if (!project) return;
    
    if (!confirm(`Eliminare il progetto "${project.traduzioni.it.titolo}"?\n\nQuesta azione è reversibile solo prima di salvare.`)) {
      return;
    }
    
    PORTFOLIO_ADMIN.progetti = PORTFOLIO_ADMIN.progetti.filter(p => p.id !== projectId);
    PORTFOLIO_ADMIN.hasChanges = true;
    
    refreshProjectsList();
    enableSaveButton();
    showNotificationPortfolio('Progetto eliminato', 'Ricorda di cliccare "Salva Modifiche"', 'info');
  }

  function extractProjectFromForm() {
    const immaginiText = document.getElementById('project-immagini').value.trim();
    const immagini = immaginiText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    
    return {
      anno: document.getElementById('project-anno').value,
      categoria: document.getElementById('project-categoria').value,
      immagini: immagini,
      traduzioni: {
        fr: {
          titolo: document.getElementById('project-titolo-fr').value.trim(),
          luogo: document.getElementById('project-luogo-fr').value.trim(),
          descrizione: document.getElementById('project-desc-fr').value.trim()
        },
        it: {
          titolo: document.getElementById('project-titolo-it').value.trim(),
          luogo: document.getElementById('project-luogo-it').value.trim(),
          descrizione: document.getElementById('project-desc-it').value.trim()
        },
        en: {
          titolo: document.getElementById('project-titolo-en').value.trim(),
          luogo: document.getElementById('project-luogo-en').value.trim(),
          descrizione: document.getElementById('project-desc-en').value.trim()
        },
        ru: {
          titolo: document.getElementById('project-titolo-ru').value.trim(),
          luogo: document.getElementById('project-luogo-ru').value.trim(),
          descrizione: document.getElementById('project-desc-ru').value.trim()
        },
        de: {
          titolo: document.getElementById('project-titolo-de').value.trim(),
          luogo: document.getElementById('project-luogo-de').value.trim(),
          descrizione: document.getElementById('project-desc-de').value.trim()
        },
        es: {
          titolo: document.getElementById('project-titolo-es').value.trim(),
          luogo: document.getElementById('project-luogo-es').value.trim(),
          descrizione: document.getElementById('project-desc-es').value.trim()
        }
      }
    };
  }

  function refreshProjectsList() {
    const list = document.getElementById('projects-list');
    if (list) {
      list.innerHTML = renderProjectsList(PORTFOLIO_ADMIN.progetti);
      
      // Gli event listener sono aggiunti in openPortfolioManager e non devono essere aggiunti qui.
    }
  }

  function enableSaveButton() {
    const btn = document.getElementById('save-json-btn');
    if (btn) {
      btn.disabled = false;
      btn.style.background = 'linear-gradient(135deg, #28a745, #218838)';
    }
  }

  // ============================================
  // SALVATAGGIO SU GITHUB
  // ============================================

  async function saveProgettiToGitHub() {
    if (!confirm('Salvare le modifiche su GitHub?\n\nIl file progetti.json verrà aggiornato e il sito ricaricato automaticamente.')) {
      return;
    }
    
    const btn = document.getElementById('save-json-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Salvataggio...';
    
    try {
      const newJSON = {
        progetti: PORTFOLIO_ADMIN.progetti
      };
      
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateJSON',
          filePath: 'data/progetti.json',
          content: JSON.stringify(newJSON, null, 2)
        })
      });
      
      if (!response.ok) {
        throw new Error('Errore salvataggio su GitHub');
      }
      
      PORTFOLIO_ADMIN.hasChanges = false;
      showNotificationPortfolio('Salvato!', 'progetti.json aggiornato su GitHub. Il sito si aggiornerà automaticamente.', 'success');
      
      btn.disabled = true;
      btn.textContent = '💾 Salva Modifiche';
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Errore:', error);
      showNotificationPortfolio('Errore', error.message, 'error');
      btn.disabled = false;
      btn.textContent = '💾 Salva Modifiche';
    }
  }

  // ============================================
  // INIZIALIZZAZIONE
  // ============================================

  function createPortfolioButton() {
    const btn = document.createElement('button');
    btn.id = 'lkr-portfolio-admin-btn';
    btn.innerHTML = '🎨 Portfolio';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 9998;
      background: linear-gradient(135deg, #6f42c1, #5a32a3);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
      transition: all 0.3s;
      display: none;
    `;
    
    btn.addEventListener('click', openPortfolioManager);
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px)';
      btn.style.boxShadow = '0 6px 16px rgba(111, 66, 193, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.3)';
    });
    
    document.body.appendChild(btn);
    
    // Il bottone è inizialmente nascosto (display: none nel CSS inline)
    // Viene reso visibile da admin.js dopo il login (per il login dinamico)
    // O viene reso visibile al caricamento della pagina se la sessione è già attiva.
    if (sessionStorage.getItem('lkr-admin-session')) {
      btn.style.display = 'flex';
      console.log('🟢 Bottone Portfolio visibile (sessione attiva al caricamento della pagina)');
    } else {
      console.log('🔴 Bottone Portfolio nascosto (sessione non attiva al caricamento della pagina)');
    }
  }

  // Inizializza quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPortfolioButton);
  } else {
    createPortfolioButton();
  }

  // CSS inline per il portfolio admin
  const style = document.createElement('style');
  style.textContent = `
    .lkr-portfolio-modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }
    
    .lkr-portfolio-manager {
      background: white;
      border-radius: 16px;
      max-width: 1200px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .lkr-portfolio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .lkr-portfolio-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .lkr-portfolio-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 4px 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .lkr-portfolio-close:hover {
      background: #f8f9fa;
      color: #dc3545;
    }
    
    .lkr-portfolio-toolbar {
      padding: 16px 24px;
      background: #f8f9fa;
      display: flex;
      gap: 12px;
    }
    
    .lkr-btn-add-project {
      background: linear-gradient(135deg, #28a745, #218838);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .lkr-btn-add-project:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40,167,69,0.3);
    }
    
    .lkr-btn-save-json {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: auto;
    }
    
    .lkr-btn-save-json:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .lkr-btn-save-json:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220,53,69,0.3);
    }
    
    .lkr-projects-list {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    
    .empty-projects {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
      font-size: 1.1rem;
    }
    
    .project-card-admin {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .project-card-admin:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }
    
    .project-thumb {
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: #f8f9fa;
    }
    
    .project-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .project-info-admin {
      padding: 16px;
    }
    
    .project-info-admin h4 {
      margin: 0 0 12px;
      font-size: 1.1rem;
    }
    
    .project-info-admin p {
      margin: 4px 0;
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .project-actions {
      padding: 12px 16px;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 8px;
    }
    
    .project-edit-btn,
    .project-delete-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    
    .project-edit-btn {
      background: #007bff;
      color: white;
    }
    
    .project-edit-btn:hover {
      background: #0056b3;
    }
    
    .project-delete-btn {
      background: #dc3545;
      color: white;
    }
    
    .project-delete-btn:hover {
      background: #c82333;
    }
    
    /* Form Modal */
    .lkr-project-form-modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 20px;
    }
    
    .lkr-project-form-container {
      background: white;
      border-radius: 16px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }
    
    .lkr-project-form-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .lkr-project-form-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    
    .project-form .form-group {
      margin-bottom: 20px;
    }
    
    .project-form label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .project-form input[type="text"],
    .project-form input[type="number"],
    .project-form select,
    .project-form textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
    }
    
    .project-form textarea {
      resize: vertical;
    }
    
    .project-form h3 {
      margin: 24px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #dc3545;
      color: #2c3e50;
    }
    
    .project-form details {
      margin-bottom: 12px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 12px;
    }
    
    .project-form summary {
      cursor: pointer;
      font-weight: 600;
      user-select: none;
    }
    
    .lkr-btn-translate-project {
      width: 100%;
      background: linear-gradient(135deg, #6f42c1, #5a32a3);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.2s;
    }
    
    .lkr-btn-translate-project:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(111,66,193,0.3);
    }
    
    .lkr-project-form-footer {
      padding: 16px 24px;
      border-top: 1px solid #e9ecef;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    .lkr-form-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 4px 12px;
      border-radius: 8px;
    }
    
    .lkr-form-close:hover {
      background: #f8f9fa;
      color: #dc3545;
    }
    
    .lkr-btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .lkr-btn-cancel:hover {
      background: #5a6268;
    }
    
    .lkr-btn-save {
      background: linear-gradient(135deg, #28a745, #218838);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .lkr-btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40,167,69,0.3);
    }
  `;
  document.head.appendChild(style);

})();

// --- Variables globales ---
const perPage = 12;
let allProjects = [];
let filteredProjects = [];
let currentPage = 1;

// --- Initialisation des filtres ---
async function initFilters() {
  try {
    const [catRes, diffRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/difficulties')
    ]);
    const { categories } = await catRes.json();
    const { difficulties } = await diffRes.json();

    const csel = document.getElementById('category-select');
    categories.forEach(c => {
      const o = document.createElement('option');
      o.value = c; 
      o.textContent = c;
      csel.appendChild(o);
    });

    const dsel = document.getElementById('difficulty-select');
    difficulties.forEach(d => {
      const o = document.createElement('option');
      o.value = d;
      o.textContent = d.charAt(0).toUpperCase() + d.slice(1);
      dsel.appendChild(o);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des filtres:', error);
  }
}

// --- Chargement des projets (avec filtres) ---
async function loadProjects(e) {
  if (e) e.preventDefault();
  try {
    const cat = document.getElementById('category-select').value;
    const diff = document.getElementById('difficulty-select').value;
    const search = document.getElementById('search-input').value.trim();
    const params = new URLSearchParams();
    if (cat) params.append('category', cat);
    if (diff) params.append('difficulty', diff);
    if (search) params.append('search', search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const resp = await fetch(`/api/projects${queryString}`);
    allProjects = await resp.json();
    filteredProjects = [...allProjects];
    currentPage = 1;
    renderProjects();
    renderPagination();
    updateResultsCount();
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// --- Affichage des projets ---
function renderProjects() {
  const start = (currentPage - 1) * perPage;
  const slice = filteredProjects.slice(start, start + perPage);
  const container = document.getElementById('projects-container');

  if (slice.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>Aucun projet trouvé</h3>
        <p>Essayez de modifier vos filtres</p>
        <button onclick="clearFilters()" class="btn btn-primary">Effacer les filtres</button>
      </div>
    `;
    return;
  }

  container.innerHTML = slice.map(p => {
    const isFavorite = getFavorites().some(f => f.title === p.title);
    return `
      <div class="feature-card" style="position: relative; cursor: pointer;" onclick='showProjectModal(${JSON.stringify(p)})'>
        <div class="project-tags">
          <span class="tag tag-category">📂 ${p.category}</span>
          <span class="tag tag-difficulty ${p.difficulty === 'medium' ? 'medium' : p.difficulty === 'hard' ? 'hard' : ''}">
            ${p.difficulty === 'easy' ? '🟢 Facile' : 
              p.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
          </span>
        </div>
        <h3 class="feature-title">${p.title}</h3>
        <p class="feature-description">${p.description.slice(0, 100)}${p.description.length > 100 ? '…' : ''}</p>
        
        <!-- Étoile de favori -->
        <div class="star-container" 
             onclick="event.stopPropagation(); toggleFavorite('${p.title}', '${p.category}', '${p.difficulty}', '${p.description.replace(/'/g, "\\'")}', this)">
          <span class="star ${isFavorite ? 'active' : ''}">
            ${isFavorite ? '★' : '☆'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// --- Pagination ---
function renderPagination() {
  const total = Math.ceil(filteredProjects.length / perPage);
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  if (total <= 1) return;

  if (currentPage > 1) {
    const btn = document.createElement('button');
    btn.textContent = '← Précédent';
    btn.onclick = () => { currentPage--; renderProjects(); renderPagination(); };
    pag.appendChild(btn);
  }

  // Afficher seulement quelques numéros de page
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(total, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => { currentPage = i; renderProjects(); renderPagination(); };
    pag.appendChild(btn);
  }

  if (currentPage < total) {
    const btn = document.createElement('button');
    btn.textContent = 'Suivant →';
    btn.onclick = () => { currentPage++; renderProjects(); renderPagination(); };
    pag.appendChild(btn);
  }
}

// --- Mise à jour du nombre ---
function updateResultsCount() {
  let countElement = document.getElementById('results-count');
  if (!countElement) {
    countElement = document.createElement('div');
    countElement.id = 'results-count';
    countElement.style.cssText = `
      text-align: center;
      margin: 1rem 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    `;
    document.getElementById('projects-container').before(countElement);
  }
  const count = filteredProjects.length;
  countElement.textContent = `${count} projet${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;
}

// --- Gestion des favoris (localStorage uniquement) ---
function getFavorites() {
  try {
    const raw = localStorage.getItem("inspicode_favorites");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des favoris:', error);
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem("inspicode_favorites", JSON.stringify(favs));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des favoris:', error);
    return false;
  }
}

function toggleFavorite(title, category, difficulty, description, element) {
  const favorites = getFavorites();
  const starElement = element.querySelector('.star');
  
  // Vérifier si déjà en favoris
  const existingIndex = favorites.findIndex(f => f.title === title);
  
  if (existingIndex !== -1) {
    // Retirer des favoris
    favorites.splice(existingIndex, 1);
    starElement.textContent = "☆";
    starElement.classList.remove("active");
    showNotification("💔 Projet retiré des favoris", "info");
  } else {
    // Ajouter aux favoris
    const newFavorite = {
      title,
      category,
      difficulty,
      description,
      addedAt: new Date().toISOString()
    };
    favorites.push(newFavorite);
    starElement.textContent = "★";
    starElement.classList.add("active");
    showNotification("⭐ Projet ajouté aux favoris!", "success");
  }
  
  saveFavorites(favorites);
}

// --- Fonction pour afficher une notification ---
function showNotification(message, type = "info") {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
    `;
    document.body.appendChild(notification);
  }
  
  const colors = {
    success: '#10b981',
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  
  // Animer l'apparition
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Faire disparaître après 3 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
  }, 3000);
}

// --- Détails du projet ---
function showProjectModal(project) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  const isFavorite = getFavorites().some(f => f.title === project.title);
  
  body.innerHTML = `
    <div class="project-tags">
      <span class="tag tag-category">📂 ${project.category}</span>
      <span class="tag tag-difficulty ${project.difficulty === 'medium' ? 'medium' : project.difficulty === 'hard' ? 'hard' : ''}">
        ${project.difficulty === 'easy' ? '🟢 Facile' : 
          project.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
      </span>
    </div>
    <h4 class="project-title">${project.title}</h4>
    <p class="project-description">${project.description}</p>
    
    <div class="project-tips" style="margin: 1.5rem 0; padding: 1rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);">
      <h5 style="margin-bottom: 0.5rem; color: var(--text-primary);">💡 Conseils pour débuter :</h5>
      <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: var(--text-secondary);">
        <li>Commencez par créer un prototype simple</li>
        <li>Divisez le projet en petites étapes réalisables</li>
        <li>Recherchez des exemples similaires pour vous inspirer</li>
        <li>N'hésitez pas à adapter la complexité à votre niveau</li>
      </ul>
    </div>
    
    <div class="modal-actions">
      <button onclick="toggleFavoriteFromModal('${project.title}', '${project.category}', '${project.difficulty}', '${project.description.replace(/'/g, "\\'")}', this)" 
              class="btn ${isFavorite ? 'btn-secondary' : 'btn-primary'}"
              style="${isFavorite ? 'background: #ef4444; color: white;' : ''}">
        ${isFavorite ? '💔 Retirer des favoris' : '⭐ Ajouter aux favoris'}
      </button>
      <button onclick="getRandomProject()" class="btn btn-secondary">
        🎲 Autre projet aléatoire
      </button>
      <a href="/favorites" class="btn btn-secondary">
        📋 Voir mes favoris
      </a>
    </div>
  `;
  modal.classList.add("active");
}

// --- Toggle favori depuis le modal ---
function toggleFavoriteFromModal(title, category, difficulty, description, button) {
  const favorites = getFavorites();
  const existingIndex = favorites.findIndex(f => f.title === title);
  
  if (existingIndex !== -1) {
    // Retirer des favoris
    favorites.splice(existingIndex, 1);
    button.textContent = "⭐ Ajouter aux favoris";
    button.className = "btn btn-primary";
    button.style.background = "";
    button.style.color = "";
    showNotification("💔 Projet retiré des favoris", "info");
  } else {
    // Ajouter aux favoris
    const newFavorite = {
      title,
      category,
      difficulty,
      description,
      addedAt: new Date().toISOString()
    };
    favorites.push(newFavorite);
    button.textContent = "💔 Retirer des favoris";
    button.className = "btn btn-secondary";
    button.style.background = "#ef4444";
    button.style.color = "white";
    showNotification("⭐ Projet ajouté aux favoris!", "success");
  }
  
  saveFavorites(favorites);
  
  // Mettre à jour l'affichage des projets
  renderProjects();
}

// --- Projet aléatoire ---
async function getRandomProject() {
  try {
    const response = await fetch('/api/random');
    const project = await response.json();
    
    if (response.ok) {
      closeModal();
      setTimeout(() => showProjectModal(project), 100);
    } else {
      showNotification('Erreur lors de la génération', 'error');
    }
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur de connexion', 'error');
  }
}

// --- Effacer les filtres ---
function clearFilters() {
  document.getElementById('category-select').value = '';
  document.getElementById('difficulty-select').value = '';
  document.getElementById('search-input').value = '';
  loadProjects();
}

// --- Fermer le modal ---
function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

// --- Recherche en temps réel ---
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  let searchTimeout;
  
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadProjects();
    }, 300); // Délai de 300ms après la dernière frappe
  });
}

// --- Gestion du thème ---
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;
  
  const storedTheme = localStorage.getItem("theme");

  // Appliquer le thème stocké
  if (storedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    toggle.textContent = "☀️";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    toggle.textContent = "🌙";
  }

  // Écouteur pour le toggle
  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    toggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", newTheme);
    
    showNotification(`Mode ${newTheme === "dark" ? "sombre" : "clair"} activé`, "info");
  });
}

// --- Initialisation ---
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFilters();
  loadProjects();
  setupSearch();
  
  // Écouteurs d'événements
  document.getElementById("filter-form").addEventListener("submit", loadProjects);
  
  // Fermer le modal si clic dehors
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal') closeModal();
  });
  
  // Raccourcis clavier
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});
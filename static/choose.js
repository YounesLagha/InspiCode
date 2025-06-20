const perPage = 12;
let allProjects = [];
let filteredProjects = [];
let currentPage = 1;

// Remplit les selects de filtres
async function initFilters() {
  const [catRes, diffRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/difficulties')
  ]);
  const { categories } = await catRes.json();
  const { difficulties } = await diffRes.json();

  const csel = document.getElementById('category-select');
  categories.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    csel.appendChild(o);
  });

  const dsel = document.getElementById('difficulty-select');
  difficulties.forEach(d => {
    const o = document.createElement('option');
    o.value = d;
    o.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    dsel.appendChild(o);
  });
}

// Récupère du back les projets filtrés puis applique recherche et pagination
async function loadProjects(e) {
  if (e) e.preventDefault();
  const cat = document.getElementById('category-select').value;
  const diff = document.getElementById('difficulty-select').value;
  const resp = await fetch(`/api/projects?${new URLSearchParams({ category: cat, difficulty: diff })}`);
  allProjects = await resp.json();
  applySearch();
}

// Filtrage client sur le mot-clé
function applySearch() {
  const term = document.getElementById('search-input').value.trim().toLowerCase();
  if (term) {
    filteredProjects = allProjects.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  } else {
    filteredProjects = [...allProjects];
  }
  currentPage = 1;
  renderProjects();
  renderPagination();
}

// Affiche les cartes de la page courante
function renderProjects() {
  const start = (currentPage - 1) * perPage;
  const slice = filteredProjects.slice(start, start + perPage);
  const container = document.getElementById('projects-container');
  container.innerHTML = slice.map(p => `
    <div class="feature-card" onclick='showProjectModal(${JSON.stringify(p)})'>
      <h3>${p.title}</h3>
      <p>${p.description.substring(0, 100)}…</p>
      <div class="project-tags">
        <span class="tag tag-category">${p.category}</span>
        <span class="tag tag-difficulty ${p.difficulty}">
          ${p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
        </span>
      </div>
    </div>
  `).join('');
}

// Création des boutons de pagination
function renderPagination() {
  const total = Math.ceil(filteredProjects.length / perPage);
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === currentPage ? 'active' : '';
    btn.onclick = () => { currentPage = i; renderProjects(); renderPagination(); };
    pag.appendChild(btn);
  }
}

// Modal de détails
function showProjectModal(project) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  const diffClass = project.difficulty === 'medium' ? 'medium'
                   : project.difficulty === 'hard'   ? 'hard'
                   : '';
  body.innerHTML = `
    <div class="project-tags">
      <span class="tag tag-category">📂 ${project.category}</span>
      <span class="tag tag-difficulty ${diffClass}">
        ${project.difficulty === 'easy'   ? '🟢 Facile'
          : project.difficulty === 'medium' ? '🟡 Moyen'
          : '🔴 Difficile'}
      </span>
    </div>
    <h4 class="project-title">${project.title}</h4>
    <p class="project-description">${project.description}</p>
  `;
  modal.classList.add('active');
}
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}
document.getElementById('modal').addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  document.getElementById('filter-form').addEventListener('submit', loadProjects);
  document.getElementById('search-input').addEventListener('input', applySearch);
  loadProjects();
});

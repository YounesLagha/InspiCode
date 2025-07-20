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
}

// --- Notification ---
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
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}

// --- Génération de projet aléatoire ---
async function getRandomProject() {
    try {
        const response = await fetch('/api/random');
        const project = await response.json();
        
        if (response.ok) {
            showProjectModal(project);
        } else {
            showNotification('Erreur: ' + (project.detail || 'Projet non trouvé'), 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la génération:', error);
        showNotification('Erreur de connexion', 'error');
    }
}

// --- Affichage du modal de projet ---
function showProjectModal(project) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    const difficultyClass = project.difficulty === 'easy' ? '' : 
                           project.difficulty === 'medium' ? 'medium' : 'hard';
    
    const isFavorite = getFavorites().some(f => f.title === project.title);
    
    modalBody.innerHTML = `
        <div class="project-tags">
            <span class="tag tag-category">📂 ${project.category}</span>
            <span class="tag tag-difficulty ${difficultyClass}">
                ${project.difficulty === 'easy' ? '🟢 Facile' : 
                  project.difficulty === 'medium' ? '🟡 Moyen' : '🔴 Difficile'}
            </span>
        </div>
        
        <h4 class="project-title">${project.title}</h4>
        <p class="project-description">${project.description}</p>
        
        <div class="project-tips">
            <h5><span>🚀</span> Par où commencer ?</h5>
            <div>Commencez par créer un prototype simple, puis enrichissez-le progressivement !</div>
        </div>
        
        <div class="modal-actions">
            <button onclick="toggleFavoriteFromModal('${project.title}', '${project.category}', '${project.difficulty}', '${project.description.replace(/'/g, "\\'")}', this)" 
                    class="btn ${isFavorite ? 'btn-secondary' : 'btn-primary'}" 
                    style="${isFavorite ? 'background: #ef4444; color: white;' : ''}">
                ${isFavorite ? '💔 Retirer des favoris' : '⭐ Ajouter aux favoris'}
            </button>
            <button onclick="getRandomProject()" class="btn btn-secondary">
                🎲 Autre projet
            </button>
            <a href="/choose" class="btn btn-secondary">
                🔍 Explorer tous
            </a>
            <a href="/favorites" class="btn btn-secondary">
                📋 Mes favoris
            </a>
        </div>
    `;
    
    modal.classList.add('active');
}

// --- Fermer le modal ---
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// --- Mise à jour des statistiques (version ultra-simple) ---
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        // Mettre à jour les chiffres avec animation
        const totalProjectsEl = document.getElementById('total-projects');
        const totalCategoriesEl = document.getElementById('total-categories');
        
        if (totalProjectsEl && stats.total_projects) {
            animateNumber(totalProjectsEl, stats.total_projects);
        }
        
        if (totalCategoriesEl && stats.categories) {
            animateNumber(totalCategoriesEl, stats.categories);
        }
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour des stats:', error);
        // Continuer sans les stats si erreur
    }
}

// --- Animation des chiffres ---
function animateNumber(element, target) {
    if (!element || !target) return;
    
    const start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// --- Smooth scroll pour la navigation ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
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
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le thème
    initTheme();
    
    // Mettre à jour les stats
    updateStats();
    
    // Initialiser le smooth scroll
    initSmoothScroll();
    
    // Fermer modal en cliquant à l'extérieur
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            getRandomProject();
        }
    });
    
    // Message de bienvenue pour nouveaux utilisateurs
    if (getFavorites().length === 0 && !localStorage.getItem('inspicode_welcomed')) {
        setTimeout(() => {
            showNotification('👋 Bienvenue sur InspiCode ! Cliquez sur ⭐ pour sauvegarder vos projets préférés.', 'info');
            localStorage.setItem('inspicode_welcomed', 'true');
        }, 2000);
    }
});
async function getRandomProject() {
        try {
            const response = await fetch('/api/random');
            const project = await response.json();
            
            if (response.ok) {
                showProjectModal(project);
            } else {
                alert('Erreur: ' + project.detail);
            }
        } catch (error) {
            alert('Erreur de connexion');
        }
    }

    function showProjectModal(project) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const difficultyClass = project.difficulty === 'easy' ? '' : 
                               project.difficulty === 'medium' ? 'medium' : 'hard';
        
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
            <div class="modal-actions">
                <button onclick="getRandomProject()" class="btn btn-primary">
                    <i class="fas fa-dice"></i>Un autre projet
                </button>
                <a href="/choose" class="btn btn-secondary">Voir tous les projets</a>
            </div>
        `;
        
        modal.classList.add('active');
    }

    function closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    // Fermer modal en cliquant à l'extérieur
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Smooth scroll
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
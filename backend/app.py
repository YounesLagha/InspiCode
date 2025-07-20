from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json
import random

app = FastAPI(title="InspiCode API", description="API pour générer des idées de projets de programmation")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monter les fichiers statiques
app.mount("/static", StaticFiles(directory="static"), name="static")

# Charger les données au démarrage
try:
    with open("static/data/Projets.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        all_projects = data["Projets"]
    print(f"✅ {len(all_projects)} projets chargés avec succès!")
except FileNotFoundError:
    print("❌ Erreur: Fichier Projets.json non trouvé!")
    all_projects = []
except json.JSONDecodeError:
    print("❌ Erreur: Format JSON invalide dans Projets.json!")
    all_projects = []

# Routes pour les pages HTML
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Page d'accueil"""
    try:
        with open("templates/index.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Page d'accueil non trouvée")

@app.get("/choose", response_class=HTMLResponse)
async def choose_page():
    """Page de sélection des critères"""
    try:
        with open("templates/choose.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Page choose non trouvée")

@app.get("/favorites", response_class=HTMLResponse)
async def favorites_page():
    """Page des favoris"""
    try:
        with open("templates/favorites.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Page favorites non trouvée")

# Routes API
@app.get("/api/projects")
async def get_projects(
    difficulty: Optional[str] = Query(None, description="Difficulté: easy, medium, hard"),
    category: Optional[str] = Query(None, description="Catégorie du projet"),
    search: Optional[str] = Query(None, description="Recherche dans le titre et description")
):
    """Récupère la liste des projets filtrés selon les critères"""
    if not all_projects:
        raise HTTPException(status_code=500, detail="Aucun projet disponible")
    
    filtered = []
    
    for proj in all_projects:
        # Filtrer par difficulté
        if difficulty and proj["difficulty"].lower() != difficulty.lower():
            continue
        # Filtrer par catégorie
        if category and category.lower() not in proj["category"].lower():
            continue
        # Filtrer par recherche textuelle
        if search:
            search_lower = search.lower()
            if (search_lower not in proj["title"].lower() and 
                search_lower not in proj["description"].lower()):
                continue
        
        filtered.append(proj)
    
    return filtered

@app.get("/api/random")
async def get_random_project(
    difficulty: Optional[str] = Query(None, description="Difficulté: easy, medium, hard"),
    category: Optional[str] = Query(None, description="Catégorie du projet")
):
    """Retourne un projet aléatoire selon les critères"""
    if not all_projects:
        raise HTTPException(status_code=500, detail="Aucun projet disponible")
    
    filtered = []
    
    for proj in all_projects:
        if difficulty and proj["difficulty"].lower() != difficulty.lower():
            continue
        if category and category.lower() not in proj["category"].lower():
            continue
        filtered.append(proj)
    
    if not filtered:
        raise HTTPException(status_code=404, detail="Aucun projet trouvé pour ces critères")
    
    return random.choice(filtered)

@app.get("/api/categories")
async def get_categories():
    """Retourne la liste des catégories disponibles"""
    if not all_projects:
        return {"categories": []}
    
    categories = list(set(proj["category"] for proj in all_projects))
    return {"categories": sorted(categories)}

@app.get("/api/difficulties")
async def get_difficulties():
    """Retourne la liste des difficultés disponibles"""
    if not all_projects:
        return {"difficulties": []}
    
    difficulties = list(set(proj["difficulty"] for proj in all_projects))
    return {"difficulties": sorted(difficulties)}

@app.get("/api/stats")
async def get_stats():
    """Retourne les statistiques basiques du site"""
    if not all_projects:
        return {"total_projects": 0, "categories": 0, "difficulties": 0}
    
    categories = set(proj["category"] for proj in all_projects)
    difficulties = set(proj["difficulty"] for proj in all_projects)
    
    return {
        "total_projects": len(all_projects),
        "categories": len(categories),
        "difficulties": len(difficulties)
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "healthy",
        "projects_loaded": len(all_projects),
        "message": "InspiCode API is running!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
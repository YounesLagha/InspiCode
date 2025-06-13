from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import random

app = FastAPI(title="InspiCode API", description="API pour générer des idées de projets de programmation")
app.mount("/static", StaticFiles(directory="static"), name="static")

class Project(BaseModel):
    title: str
    description: str
    category: str
    difficulty: str

with open("Projets.json", "r", encoding="utf-8") as f:
    data = json.load(f)
    all_projects = data["Projets"]

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Page d'accueil"""
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/choose", response_class=HTMLResponse)
async def choose_page():
    """Page de sélection des critères"""
    with open("templates/choose.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/api/projects", response_model=List[Project])
async def get_projects(
    difficulty: Optional[str] = Query(None, description="Difficulté: easy, medium, hard"),
    category: Optional[str] = Query(None, description="Catégorie du projet")
):
    """
    Récupère la liste des projets filtrés selon les critères
    """
    filtered = []
    
    for proj in all_projects:
        # Filtrer par difficulté
        if difficulty and proj["difficulty"].lower() != difficulty.lower():
            continue
        # Filtrer par catégorie
        if category and category.lower() not in proj["category"].lower():
            continue
        filtered.append(proj)
    
    return filtered

@app.get("/api/random", response_model=Project)
async def get_random_project(
    difficulty: Optional[str] = Query(None, description="Difficulté: easy, medium, hard"),
    category: Optional[str] = Query(None, description="Catégorie du projet")
):
    """
    Retourne un projet aléatoire selon les critères
    """
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
    """
    Retourne la liste des catégories disponibles
    """
    categories = list(set(proj["category"] for proj in all_projects))
    return {"categories": sorted(categories)}

@app.get("/api/difficulties")
async def get_difficulties():
    """
    Retourne la liste des difficultés disponibles
    """
    difficulties = list(set(proj["difficulty"] for proj in all_projects))
    return {"difficulties": sorted(difficulties)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
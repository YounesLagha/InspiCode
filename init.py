#!/usr/bin/env python3
"""
Script d'initialisation pour InspiCode
Lance le serveur avec la configuration appropriée
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Vérifie que les dépendances sont installées"""
    try:
        import fastapi
        import uvicorn
        import pydantic
        print("✅ Dépendances trouvées")
        return True
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        return False

def install_dependencies():
    """Installe les dépendances depuis requirements.txt"""
    print("📦 Installation des dépendances...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("✅ Dépendances installées avec succès")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'installation: {e}")
        return False

def check_files():
    """Vérifie que les fichiers nécessaires existent"""
    required_files = [
        "backend/app.py",
        "requirements.txt",
        "static/data/Projets.json",
        "templates/index.html",
        "templates/choose.html",
        "templates/favorites.html",
    ]
    
    missing_files = [file for file in required_files if not Path(file).exists()]
    
    if missing_files:
        print(f"❌ Fichiers manquants: {', '.join(missing_files)}")
        return False
    
    print("✅ Tous les fichiers nécessaires sont présents")
    return True

def create_directories():
    """Crée les répertoires nécessaires"""
    directories = [
        "static/css",
        "static/js",
        "static/data",
        "templates"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Répertoires créés")

def run_server():
    """Lance le serveur de développement"""
    print("🚀 Démarrage du serveur InspiCode...")
    print("📍 Serveur disponible sur: http://localhost:8000")
    print("🔧 Mode développement activé")
    print("⏹️  Arrêt avec Ctrl+C")
    
    try:
        import uvicorn
        uvicorn.run(
            "backend.app:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Serveur arrêté")
    except Exception as e:
        print(f"❌ Erreur serveur: {e}")

def main():
    """Fonction principale"""
    print("🚀 Initialisation d'InspiCode")
    print("=" * 50)
    
    # Vérifier les fichiers
    if not check_files():
        print("❌ Veuillez vous assurer que tous les fichiers sont présents")
        return
    
    # Créer les répertoires
    create_directories()
    
    # Vérifier les dépendances
    if not check_dependencies():
        print("📦 Installation des dépendances...")
        if not install_dependencies():
            return
    print("\n✅ Initialisation terminée!")
    print("=" * 50)
    
    # Demander si on veut lancer le serveur
    response = input("🚀 Voulez-vous lancer le serveur maintenant? (y/n): ")
    if response.lower() in ['y', 'yes', 'o', 'oui']:
        run_server()
    else:
        print("💡 Pour lancer le serveur manuellement:")
        print("   py init.py")

if __name__ == "__main__":
    main()
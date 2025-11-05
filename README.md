# InspiCode

A web application that helps computer science students and developers find coding project ideas tailored to their skill level.

## About

InspiCode provides a curated collection of 150+ project ideas, filterable by difficulty level and category. Whether you're building your portfolio, learning a new technology, or simply looking for coding practice, InspiCode helps you find the right project.

## Features

- Browse and filter projects by difficulty (Easy, Medium, Hard)
- Search projects by category (Frontend, Backend, Mobile, etc.)
- Real-time keyword search
- Save favorite projects to local storage
- Random project generator
- Export favorites as JSON
- Dark/Light theme toggle
- Responsive design for all devices

## Tech Stack

**Backend**
- FastAPI (Python web framework)
- Uvicorn (ASGI server)
- Python 3.8+

**Frontend**
- HTML5, CSS3, JavaScript 
- LocalStorage for data persistence

## Installation

### Prerequisites
- Python 3.8 or higher
- pip

### Setup

1. Clone the repository
```bash
git clone https://github.com/YounesLagha/inspicode.git
cd inspicode
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Run the application
```bash
py init.py
```

4. Open your browser and navigate to `http://localhost:8000`

## Project Structure

```
inspicode/
├── backend/
│   └── app.py
├── static/
│   ├── css/
│   ├── js/
│   └── data/
│       └── Projets.json
├── templates/
│   ├── index.html
│   ├── choose.html
│   └── favorites.html
├── requirements.txt
├── README.md
└── init.py
```

## API Endpoints

```
GET  /api/projects          # List all projects with optional filters
GET  /api/random            # Get a random project
GET  /api/categories        # List all categories
GET  /api/difficulties      # List difficulty levels
GET  /api/stats             # Get site statistics
GET  /health                # Health check
```

## Usage

### Explorer Page
- Use filters to narrow down projects by difficulty, category, or keywords
- Click on any project card to view details
- Click the star icon to add projects to favorites

### Favorites Page
- View all saved projects
- Export your favorites as JSON
- Remove individual projects or clear all at once

## Author

Younes Lagha
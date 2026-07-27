# DevLogger - Developer Productivity & Learning Tracker

A full-stack web application built with Django REST Framework and React that helps developers track their coding journey, manage projects, log daily activities, and organize learning resources.

## Features

-  **Dashboard** - Overview of your coding statistics and recent activities
-  **Journal** - Daily coding journal with markdown support
-  **Projects** - Manage and showcase your development projects
-  **Skills** - Track your technical skills and proficiency levels
-  **Resources** - Organize learning materials and bookmarks
-  **Code Snippets** - Save and manage reusable code snippets
-  **Goals** - Set and track your learning goals
-  **Activities** - Log daily coding hours, commits, and productivity

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework
- JWT Authentication
- SQLite Database (easily upgradable to PostgreSQL)

### Frontend
- React 18
- React Router
- Bootstrap 5 & React-Bootstrap
- Recharts for data visualization
- React Markdown for content rendering
- Syntax Highlighter for code display

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
5. Create superuser (admin):
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Usage

1. Register a new account or login
2. Start by setting up your profile
3. Add your skills and set your goals
4. Log your daily coding activities
5. Create projects and journal entries
6. Save useful learning resources and code snippets

## API Endpoints

- `/api/auth/register/` - User registration
- `/api/auth/login/` - User login
- `/api/auth/refresh/` - Refresh JWT token
- `/api/dashboard/stats/` - Dashboard statistics
- `/api/skills/` - Skills CRUD
- `/api/journal/` - Journal entries CRUD
- `/api/projects/` - Projects CRUD
- `/api/resources/` - Learning resources CRUD
- `/api/snippets/` - Code snippets CRUD
- `/api/goals/` - Goals CRUD
- `/api/activities/` - Coding activities CRUD

## Project Structure





# DevLogger

A full-stack developer logging platform built with Django REST Framework and React.

## Features

- JWT Authentication
- REST APIs
- User Profiles
- Dashboard
- CRUD Operations

## Tech Stack

Backend
- Django
- DRF
- PostgreSQL

Frontend
- React
- Bootstrap

Deployment
- Docker
- Render

## Live Demo

Frontend:
https://your-frontend.onrender.com

Backend:
https://your-backend.onrender.com

## Run Locally

docker compose up --build
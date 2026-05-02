# 🕊️ Funeral Intelligence Platform (FIP)

A production-ready, AI-powered SaaS platform for discovering, comparing, and interacting with funeral service providers.

## ✨ Features

- **Web Scraper** — Extract funeral provider data (name, phone, address, services, pricing) from any website
- **Provider Database** — PostgreSQL-backed storage with full-text search
- **AI Chat Assistant** — GPT-4 powered assistant with real provider data as context
- **Modern UI** — React + Tailwind CSS with premium SaaS design

## 🗂 Project Structure

```
fip/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings & env vars
│   ├── database.py          # Async SQLAlchemy setup
│   ├── models/
│   │   └── provider.py      # Provider ORM model
│   ├── routes/
│   │   ├── providers.py     # POST /scrape, GET /providers, GET /search
│   │   └── chat.py          # POST /chat
│   ├── services/
│   │   ├── provider_service.py  # DB operations
│   │   └── ai_service.py        # OpenAI integration
│   ├── scraper/
│   │   └── funeral_scraper.py   # BeautifulSoup scraper
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProviderCard.jsx
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Providers.jsx
    │   │   ├── Scraper.jsx
    │   │   └── Chat.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/fip_db
#   OPENAI_API_KEY=sk-your-key-here

# Create database
psql -U postgres -c "CREATE DATABASE fip_db;"

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000  
Swagger docs at http://localhost:8000/docs

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

The app will be available at http://localhost:5173

---

## 📡 API Reference

### POST /scrape
Scrape a funeral home website and store the data.

```json
POST /scrape
{
  "url": "https://www.example-funeral-home.com"
}

Response:
{
  "success": true,
  "message": "Successfully scraped and saved 'Smith Funeral Home'",
  "provider": { "id": "...", "name": "...", "phone": "...", ... },
  "already_exists": false
}
```

### GET /providers
Get all providers with pagination.

```
GET /providers?limit=100&offset=0
```

### GET /search
Full-text search across providers.

```
GET /search?q=cremation&limit=50
```

### POST /chat
Chat with the AI assistant.

```json
POST /chat
{
  "message": "What funeral providers offer cremation in Texas?",
  "history": []
}

Response:
{
  "reply": "Based on our database...",
  "providers_used": 42
}
```

---

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://postgres:pass@localhost:5432/fip_db` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## 🛠 Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (async) + PostgreSQL
- BeautifulSoup4 + lxml
- OpenAI GPT-4o-mini

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Axios
- React Router v6
- react-hot-toast

---

## 🚢 Production Deployment

### Docker (Recommended)

```bash
# Backend
docker build -t fip-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env fip-backend

# Frontend
docker build -t fip-frontend ./frontend
docker run -p 80:80 fip-frontend
```

### Environment checklist
- [ ] Set `DATABASE_URL` to production PostgreSQL
- [ ] Set `OPENAI_API_KEY` 
- [ ] Set `CORS_ORIGINS` to your frontend domain
- [ ] Set `VITE_API_URL` to your backend domain
- [ ] Run `npm run build` for frontend production build

---

## 📝 Notes

- The scraper works best on simple HTML funeral home websites
- Some sites with JavaScript-heavy content may return limited data
- OpenAI API costs apply for the /chat endpoint
- The AI uses GPT-4o-mini by default (cost-efficient); change to `gpt-4o` for best quality in `services/ai_service.py`

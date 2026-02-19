# OpenSprint

OpenSprint is a personal sprint and deep-dive logging system designed for engineers who want to document their thinking process, not just outcomes.

It allows you to:

- Create sprints
- Log deep dives into problems, hypotheses, tests, and conclusions
- Maintain a public engineering journal
- Share your sprint history publicly

This is not a task manager.

This is a thinking tracker.

---

## Architecture

opensprint/
├── backend/ FastAPI + MongoDB
├── frontend/ React + Tailwind

---

## Features

### Authentication
- GitHub OAuth login
- Secure cookie-based sessions

### Sprint Management
- Create, update, delete sprints
- Mark sprint complete
- Public sprint visibility

### Deep Dive Logging
- Log structured investigations
- Edit and delete deep dives
- Lock deep dives after sprint completion

### Public Profiles
- Public profile page
- Public sprint pages
- Shareable URLs

---

## Running Locally

### Backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

Fill environment variables

uvicorn app.main:app --reload

Backend runs on: http://localhost:8000


---

### Frontend

cd frontend
npm install
cp .env.example .env
npm run dev

Frontend runs on: http://localhost:5173


---

## Environment Variables

Backend requires:

MONGO_URI=
DATABASE_NAME=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=
JWT_SECRET=


Frontend requires:

VITE_API_BASE_URL=

---

## Philosophy

OpenSprint is designed to document thinking, not just results.

It encourages:

- Deep investigation
- Structured reflection
- Public learning

---

## Future Plans

- Deployment support
- Public contribution system
- Analytics on deep dive patterns
- Team sprint support

---

## License

MIT

# Contributing to OpenSprint

Thank you for your interest in contributing to OpenSprint.

OpenSprint is designed as a structured engineering journal platform. Our focus is on building a reliable, extensible core system.

We prioritize core platform improvements over cosmetic changes.

---

## Core Contribution Areas

We welcome contributions in these areas:

### Backend
- API design improvements
- Database structure improvements
- Authentication and security enhancements
- Performance improvements
- Data integrity and validation

### Frontend Architecture
- Service layer improvements
- State management improvements
- Component modularization
- Performance optimization

### Platform Stability
- Bug fixes
- Error handling improvements
- Edge case handling

---

## Areas to Avoid (for now)

Please avoid:

- UI redesigns without architectural benefit
- Adding heavy dependencies without justification
- Cosmetic-only changes

OpenSprint is focused on platform reliability first.

---

## Development Setup

### Backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

### Frontend

cd frontend
npm install
cp .env.example .env
npm run dev

## Code Structure Guidelines

Frontend follows this structure:

api/ HTTP client layer
services/ Business logic layer
pages/ UI layer
utils/ Helpers


Please maintain this separation.

Do not call API directly from UI components.

Use services layer.

---

## Pull Request Guidelines

- Keep pull requests focused
- Explain reasoning clearly
- Avoid unrelated changes in same PR

---

## Philosophy

OpenSprint exists to help engineers document thinking, not just outcomes.

Contributions should strengthen this purpose.

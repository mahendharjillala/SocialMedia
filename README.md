# SocialMedia Monorepo

This repository contains both the backend (Java/Maven) and frontend (Node/Vite) for the SocialMedia application.

## Structure

- `backend/` — Spring Boot (Maven) service
- `frontend/` — Vite + TypeScript + Tailwind frontend

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm 9+
- Docker (optional) if you prefer containerized runs

### Backend

From `backend/`:

```bash
mvn spring-boot:run
```

Or build a jar:

```bash
mvn clean package
java -jar target/*.jar
```

Configuration is typically managed via `application.properties` or environment variables.

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Development

- Linting/formatting tools are configured in the frontend (`eslint`, `tailwind`).
- The backend uses standard Spring Boot project structure with Maven.

## Docker (optional)

Both `backend/` and `frontend/` have Dockerfiles. You can build images individually from within each directory:

```bash
# Backend
cd backend && docker build -t socialmedia-backend:latest .

# Frontend
cd ../frontend && docker build -t socialmedia-frontend:latest .
```

## Monorepo Notes

This repository is organized as a single monorepo. The `backend/` and `frontend/` live side-by-side and are committed together. If you previously had them as separate repositories, their histories may not be preserved here unless explicitly imported with `git subtree`.

## License

Add your license here.

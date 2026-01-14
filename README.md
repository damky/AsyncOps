AsyncOps

Async-first operations dashboard for remote teams

This project was built to demonstrate production-style full-stack development for remote teams, including cloud deployment, async workflows, and engineering tradeoffs.

⸻

🚩 Problem

Remote teams struggle with:
	•	status updates getting lost in chat
	•	meetings replacing documentation
	•	decisions being made with no historical context

AsyncOps centralizes updates, blockers, and decisions into a single async-friendly system so distributed teams can operate with clarity instead of meetings.

Why this matters to employers: fewer meetings, better documentation, faster onboarding.

⸻

🎯 Solution

AsyncOps provides:
	•	structured async status updates
	•	incident & blocker tracking
	•	a decision log with historical context
	•	automated summaries for async visibility

Designed for remote-first, async teams where written communication and clarity matter.

⸻

🧱 Tech Stack

Layer	    Tech	                    Why
Frontend	React + TypeScript	        Type safety, predictable UI, scalable components
Backend	    FastAPI (Python)	        Clean API layer, async-ready
Database	PostgreSQL	                Relational integrity, auditability
Auth	    JWT / OAuth	                Secure role-based access
Infra	    AWS (ECS/RDS)	            Production-style deployment
DevOps	    Docker + GitHub Actions	    Repeatable builds, CI/CD

⸻

🏗 Architecture Overview

React (Client)
   ↓ REST API
API Server (FastAPI)
   ↓
PostgreSQL (RDS)
   ↓
Background Jobs (Daily Summary worker)

⸻

✨ Key Features
	•	Role-based authentication (admin / member)
	•	Async status updates with timestamps
	•	Incident & blocker tracking
	•	Decision log with audit history
	•	Daily async summary generation
	•	Fully containerized deployment

⸻

🔒 Security & Best Practices
	•	Environment-based secrets management
	•	Input validation & error handling
	•	OWASP-aware API design
	•	Principle of least privilege for roles

⸻

🧪 Testing & Quality
	•	Unit tests for core business logic
	•	API request validation
	•	TypeScript strict mode enabled
	•	Linting + formatting enforced in CI
	•	Manual test checklist in testing/TESTING.md

⸻

🚀 Getting Started (Local)

Quick start:

```bash
git clone <repository-url>
cd AsyncOps
cp .env.example .env
docker-compose up
```

For the full setup guide, see docs/setup.md.

Docs index:
	•	Setup: docs/setup.md
	•	Development: docs/development-setup.md
	•	API spec: docs/api-specification.md
	•	Architecture: docs/architecture.md
	•	Progress: docs/progress.md
	•	Testing: testing/TESTING.md

⸻

📦 Deployment
	•	Dockerized services
	•	CI/CD via GitHub Actions
	•	Deployed to AWS ECS with RDS Postgres
	•	Zero-downtime deploy strategy (basic rolling update)

⸻

⚖️ Tradeoffs & Decisions

Examples:
	•	Chose REST over GraphQL for simplicity and clarity
	•	Prioritized readability over micro-optimizations
	•	Deferred real-time updates in favor of async summaries
	•	Limited feature scope to ensure stability

⸻

🔮 Future Improvements
	•	Slack / email integrations
	•	Organization-level analytics
	•	Granular permissions
	•	Real-time updates via WebSockets

⸻

👤 About the Developer

Dougie McKay is a Frontend heavy full stack developer based out of Utah. He has a BFA in Photography from BYU-Idaho. He is a third generation engineering brain troubleshooter and self taught developer.
	•	Built as a portfolio project focused on remote-first engineering
	•	Emphasis on clarity, maintainability, and async workflows
	•	Open to feedback and iteration

[LinkedIn](https://www.linkedin.com/in/dougie-mckay-a3278221/) • [Portfolio](https://damky.net)



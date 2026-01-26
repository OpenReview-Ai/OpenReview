# OpenReview

## AI-powered code reviewer that teaches while it reviews

OpenReview is a local, educational code review tool designed for students. Unlike traditional code reviewers that just flag issues, OpenReview explains why something is wrong, how to fix it, and provides learning resources — all powered by local LLMs.

---

## 🌟 Features

- 🔒 100% Local: Runs entirely on your machine using Ollama (no API costs)
- 🎚️ Adaptive Learning Modes: Beginner, Intermediate, and Senior difficulty levels
- 🔍 Comprehensive Analysis: Bugs, security issues, code smells, and best practices
- ⚡ GitHub Integration: Automatically reviews PRs via webhooks
- 📊 Track Progress: See your improvement over time

---

## 🏗️ Architecture

```
GitHub PR → Webhook → Queue → LLM Analysis → Formatted Comment → GitHub
```

---

## 🛠️ Tech Stack

- Backend: Node.js + TypeScript + Express
- LLM: Ollama (CodeLlama, DeepSeek Coder, or similar)
- Database: PostgreSQL + Prisma
- Queue: BullMQ + Redis
- Cache: Redis

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Ollama installed locally

---

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/openreview-ai.git
cd openreview-ai
npm install
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Ollama
npm run docker:dev
```

### 3. Pull LLM Model
```bash
ollama pull codellama:13b
```
or
```bash
ollama pull deepseek-coder:6.7b
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your GitHub credentials
```

Edit .env with your GitHub credentials

### 5. Run Migrations
```bash
cd apps/server
npx prisma migrate dev
```

### 6. Start Development Server
```bash
npm run dev
```

The server will start on ```http://localhost:3000```

---

## 📖 Setup Guide

### GitHub App Configuration

- Create a GitHub App (guide)
- Set webhook URL: ```https://your-domain.com/webhooks/github```
- Subscribe to events: pull_request, pull_request_review
- Generate private key and add to ```.env```

### Webhook Testing (Local)

Use ngrok or smee.io for local testing:

```bash
ngrok http 3000
# Use the ngrok URL as your webhook URL
```

---

## 📁 Project Structure

```
openreview/
│
├── apps/
│   └── server/                       # Main backend service
│       ├── src/
│       │   ├── index.ts              # App entry point
│       │   ├── app.ts                # Express app setup
│       │   │
│       │   ├── config/               # Configuration management
│       │   │   ├── env.ts            # Environment variables
│       │   │   ├── github.ts         # GitHub API config
│       │   │   ├── models.ts         # Ollama model configs
│       │   │   └── review.config.ts  # Review behavior settings
│       │   │
│       │   ├── webhooks/             # GitHub webhook handling
│       │   │   ├── github.controller.ts
│       │   │   ├── github.routes.ts
│       │   │   └── webhook.validator.ts
│       │   │
│       │   ├── github/               # GitHub API integration
│       │   │   ├── github.client.ts
│       │   │   ├── pullRequest.service.ts
│       │   │   ├── comments.service.ts
│       │   │   └── diff.parser.ts
│       │   │
│       │   ├── llm/                  # Local LLM layer
│       │   │   ├── ollama.client.ts
│       │   │   ├── model.selector.ts
│       │   │   └── llm.service.ts
│       │   │
│       │   ├── review/               # Code review engine
│       │   │   ├── review.service.ts
│       │   │   ├── review.orchestrator.ts
│       │   │   │
│       │   │   ├── rules/            # Language-specific rules
│       │   │   │   ├── index.ts
│       │   │   │   ├── general.rules.ts
│       │   │   │   ├── typescript.rules.ts
│       │   │   │   ├── javascript.rules.ts
│       │   │   │   ├── node.rules.ts
│       │   │   │   └── react.rules.ts
│       │   │   │
│       │   │   ├── modes/            # Skill-level modes
│       │   │   │   ├── index.ts
│       │   │   │   ├── beginner.mode.ts
│       │   │   │   ├── intermediate.mode.ts
│       │   │   │   └── senior.mode.ts
│       │   │   │
│       │   │   ├── analyzers/        # Code analysis
│       │   │   │   ├── bug.analyzer.ts
│       │   │   │   ├── security.analyzer.ts
│       │   │   │   ├── smell.analyzer.ts
│       │   │   │   └── bestpractice.analyzer.ts
│       │   │   │
│       │   │   └── severity.ts
│       │   │
│       │   ├── prompts/              # Prompt engineering
│       │   │   ├── system.prompt.ts
│       │   │   ├── review.prompt.ts
│       │   │   ├── beginner.prompt.ts
│       │   │   ├── intermediate.prompt.ts
│       │   │   ├── senior.prompt.ts
│       │   │   └── templates/
│       │   │       ├── bug.template.ts
│       │   │       ├── security.template.ts
│       │   │       └── explanation.template.ts
│       │   │
│       │   ├── formatters/           # Output formatting
│       │   │   ├── comment.formatter.ts
│       │   │   ├── markdown.builder.ts
│       │   │   ├── severity.badge.ts
│       │   │   └── learning.links.ts
│       │   │
│       │   ├── queue/                # Job queue system
│       │   │   ├── review.queue.ts
│       │   │   ├── queue.processor.ts
│       │   │   └── jobs/
│       │   │       ├── review.job.ts
│       │   │       └── comment.job.ts
│       │   │
│       │   ├── db/                   # Database layer
│       │   │   ├── prisma/
│       │   │   │   ├── schema.prisma
│       │   │   │   └── migrations/
│       │   │   │
│       │   │   ├── repositories/
│       │   │   │   ├── pullRequest.repository.ts
│       │   │   │   ├── review.repository.ts
│       │   │   │   └── user.repository.ts
│       │   │   │
│       │   │   └── client.ts
│       │   │
│       │   ├── cache/                # Caching layer
│       │   │   ├── cache.service.ts
│       │   │   └── redis.client.ts
│       │   │
│       │   ├── utils/                # Utilities
│       │   │   ├── logger.ts
│       │   │   ├── tokenizer.ts
│       │   │   ├── fileFilter.ts
│       │   │   ├── diffParser.util.ts
│       │   │   └── retry.util.ts
│       │   │
│       │   ├── types/                # TypeScript types
│       │   │   ├── github.ts
│       │   │   ├── review.ts
│       │   │   ├── webhook.ts
│       │   │   ├── llm.ts
│       │   │   └── queue.ts
│       │   │
│       │   └── middlewares/          # Express middlewares
│       │       ├── error.middleware.ts
│       │       ├── webhook.middleware.ts
│       │       ├── auth.middleware.ts
│       │       ├── rateLimit.middleware.ts
│       │       └── logging.middleware.ts
│       │
│       ├── tests/                    # Test suite
│       │   ├── unit/
│       │   │   ├── review.service.test.ts
│       │   │   ├── llm.service.test.ts
│       │   │   └── diff.parser.test.ts
│       │   │
│       │   ├── integration/
│       │   │   ├── webhook.test.ts
│       │   │   └── github.test.ts
│       │   │
│       │   ├── e2e/
│       │   │   └── full-review.test.ts
│       │   │
│       │   └── fixtures/
│       │       ├── sample-prs/
│       │       ├── sample-diffs/
│       │       └── mock-responses/
│       │
│       ├── package.json
│       ├── tsconfig.json
│       ├── nodemon.json
│       ├── jest.config.js
│       └── .env.example
│
├── packages/                         # Shared packages (future)
│   └── shared/
│       ├── constants/
│       ├── types/
│       └── utils/
│
├── scripts/                         # Utility scripts
│   ├── test-webhook.sh              # Test webhook locally
│   ├── setup-ollama.sh              # Pull required models
│   ├── seed-db.ts                   # Seed test data
│   └── generate-types.ts            # Generate types from schema
│
├── docs/                            # Documentation
│   ├── architecture.md              # System architecture
│   ├── setup-local.md               # Local development setup
│   ├── setup-production.md          # Production deployment
│   ├── ollama-models.md             # Model selection guide
│   ├── api-reference.md             # API documentation
│   ├── webhook-setup.md             # GitHub webhook setup
│   ├── prompts-guide.md             # Prompt engineering guide
│   ├── contribution.md              # Contributing guidelines
│   └── diagrams/                    # Architecture diagrams
│       ├── system-flow.png
│       └── review-pipeline.png
│
├── examples/                        # Demo & sample data
│   ├── sample-diff.txt
│   ├── sample-review.json
│   ├── sample-pr-payload.json
│   └── sample-comments/
│       ├── beginner-mode.md
│       ├── intermediate-mode.md
│       └── senior-mode.md
│
├── .github/                         # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── lint.yml
│   │   └── test.yml
│   │
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .husky/                          # Git hooks
│   ├── pre-commit
│   └── pre-push
│
├── docker/                          # Docker configuration
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
│
├── .env.example                     # Environment variables template
├── .env.development
├── .env.test
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── docker-compose.dev.yml
├── README.md
├── LICENSE
├── CHANGELOG.md
└── package.json                     # Root package.json (workspace)
```

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a PR

---

# OpenReview

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**AI-powered code reviewer that teaches while it reviews**

OpenReview automatically reviews your code commits using local AI models, providing intelligent feedback directly in your pull requests—no cloud services required.

## Features

- **Local AI Reviews** - Powered by Open Source LLM running on Ollama
- **Privacy First** - All processing happens on your machine
- **Instant Feedback** - Automated reviews on every commit
- **GitHub Integration** - Seamless webhook based workflow
- **One-Command Setup** - Docker Compose handles everything
- **100% Open Source** - No API costs, no vendor lock in

## Architecture
```
GitHub Push → Webhook → Spring Boot → Ollama (LLM) → Review Comment
```

**Stack:**
- Spring Boot 4.0.2 - Webhook receiver & orchestration
- Ollama - Local LLM runtime
- DeepSeek-Coder-6.7B - Code review model
- GitHub API - Fetch diffs & post comments

## Quick Start

### Prerequisites

- Docker & Docker Compose
- GitHub account with admin access to a repository
- 8GB+ RAM (for running DeepSeek model)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/openreview.git
   cd openreview
```

2. **Configure environment variables**
```bash
   cp .env.example .env
```

Edit `.env` and set:
```properties
   GITHUB_TOKEN=ghp_your_github_personal_access_token
   WEBHOOK_SECRET=your_random_secret_string
```

3. **Start the services**
```bash
   docker-compose up -d
```

4. **Pull the AI model** (first time only - ~4GB download)
```bash
   docker exec openreview-ollama ollama pull deepseek-coder:6.7b
```

5. **Configure GitHub webhook**

   In your GitHub repository:
    - Go to **Settings → Webhooks → Add webhook**
    - **Payload URL**: `http://your-server-ip:8080/api/webhook`
    - **Content type**: `application/json`
    - **Secret**: (same as `WEBHOOK_SECRET` in `.env`)
    - **Events**: Select "Pull requests" and "Pushes"

### Verify Installation
```bash
# Check service health
curl http://localhost:8080/actuator/health

# Check Ollama
curl http://localhost:11434/api/tags
```

## Usage

Once configured, OpenReview works automatically:

1. Create a pull request or push commits to your repository
2. OpenReview receives the webhook notification
3. Fetches the code diff from GitHub
4. Sends it to LLM for analysis
5. Posts review comments directly on your PR

### Example Review Comment
```
OpenReview Analysis

**Potential Issues:**
- Line 23: Potential null pointer exception - consider adding null check
- Line 45: Variable naming could be more descriptive (use `userRepository` instead of `repo`)

**Suggestions:**
- Consider extracting this logic into a separate service method for better testability
- Add input validation for the `email` parameter

**Security:**
No obvious security vulnerabilities detected
```

## Configuration

### Application Settings (`application.yml`)
```yaml
github:
  token: ${GITHUB_TOKEN}
  webhook-secret: ${WEBHOOK_SECRET}

ollama:
  url: http://ollama:11434
  model: deepseek-coder:6.7b
  timeout: 60s

review:
  max-diff-size: 10000  # Skip files larger than this
  excluded-paths:
    - "*.lock"
    - "package-lock.json"
    - "yarn.lock"
```

### Creating a GitHub Token

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Select scopes:
    - `repo` (Full control of private repositories)
    - `write:discussion` (for PR comments)
4. Generate and copy the token

## Development

### Project Structure
```
openreview/
├── src/main/java/com/openreview/
│   ├── OpenReviewApplication.java
│   ├── controller/
│   │   └── WebhookController.java      # Handles GitHub webhooks
│   ├── service/
│   │   ├── GitHubService.java          # GitHub API integration
│   │   ├── OllamaService.java          # Ollama LLM communication
│   │   └── ReviewService.java          # Review orchestration
│   ├── model/
│   │   ├── WebhookPayload.java
│   │   └── ReviewResult.java
│   └── config/
│       └── GitHubConfig.java
├── docker-compose.yml
├── Dockerfile
└── README.md
```

### Running Locally (Without Docker)
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Pull model
ollama pull deepseek-coder:6.7b

# Terminal 3: Run Spring Boot
./mvnw spring-boot:run
```

### Running Tests
```bash
./mvnw test
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Java code conventions
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

---

**If you find OpenReview useful, please consider giving it a star!**

# OpenReview

## AI-powered code reviewer that teaches while it reviews

OpenReview is a local, educational code review tool designed for students. Unlike traditional code reviewers that just flag issues, OpenReview explains why something is wrong, how to fix it, and provides learning resources — all powered by local LLMs.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

- **🎯 Educational First**: Every code review includes detailed explanations and curated learning resources
- **🔒 100% Local**: Runs entirely on your machine using Ollama (zero API costs, complete privacy)
- **🎚️ Adaptive Learning Modes**: 
  - **Beginner**: Detailed explanations with examples and resources
  - **Intermediate**: Balanced feedback with context
  - **Senior**: Concise, impact-focused reviews
- **🔍 Comprehensive Analysis**: 
  - 🐛 Bugs and logic errors
  - 🔒 Security vulnerabilities
  - 👃 Code smells and anti-patterns
  - ✨ Best practices violations
  - ⚡ Performance issues
- **⚡ GitHub Integration**: Automatically reviews PRs via webhooks
- **📊 Progress Tracking**: See improvement over time with stored review history
- **🚀 Async Processing**: Queue-based architecture handles large PRs efficiently

## 🏗️ Architecture

```
┌─────────────┐           ┌──────────────┐          ┌─────────────┐
│   GitHub    │  ─────▶  │   Webhook    │  ─────▶  │    Queue    │
│  (PR Event) │           │  Controller  │          │   (Redis)   │
└─────────────┘           └──────────────┘          └─────────────┘
                                                           │
                                                           ▼
┌─────────────┐           ┌──────────────┐          ┌─────────────┐
│   GitHub    │  ◀─────  │   Comment    │  ◀─────  │   Review    │
│ (PR Comment)│           │  Formatter   │          │ Orchestrator│
└─────────────┘           └──────────────┘          └─────────────┘
                                                           │
                                                           ▼
                                           ┌──────────────────────────────────┐
                                           │        Code Analyzers            │
                                           │  ┌────────┐  ┌────────────┐      │
                                           │  │  Bug   │  │  Security  │      │
                                           │  └────────┘  └────────────┘      │
                                           │  ┌────────┐  ┌────────────┐      │
                                           │  │ Smell  │  │Best Practice│     │
                                           │  └────────┘  └────────────┘      │
                                           └──────────────┬───────────────────┘
                                                          ▼
                                                  ┌──────────────┐
                                                  │ Ollama (LLM) │
                                                  │ CodeLlama    │
                                                  └──────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 4.0.2, Java 21 |
| **LLM** | Ollama (CodeLlama, DeepSeek Coder) |
| **Database** | PostgreSQL + Spring Data JPA |
| **Cache** | Redis (Spring Cache) |
| **Queue** | Redis-based async processing |
| **Migration** | Flyway |
| **Monitoring** | Spring Actuator + Micrometer + Prometheus |
| **GitHub** | GitHub API (Octokit Java) |
| **Testing** | JUnit 5, Mockito, Testcontainers, WireMock |
| **Build** | Maven |

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher ([Download](https://openjdk.org/))
- **Maven 3.8+** (or use included wrapper `./mvnw`)
- **Docker & Docker Compose**
- **Ollama** installed locally ([Installation Guide](https://ollama.ai))

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/openreview-ai.git
cd openreview-ai
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Ollama
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose ps
```

### 3. Pull LLM Model

```bash
# Pull CodeLlama 13B (recommended)
ollama pull codellama:13b

# Or for faster reviews (smaller model)
ollama pull deepseek-coder:6.7b

# Verify model is ready
ollama list
```

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your GitHub token
nano .env
```

**Required Environment Variables:**
```bash
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

### 5. Run Application

```bash
# Run with development profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Or build and run JAR
./mvnw clean package
java -jar target/openreview-ai-1.0.0.jar
```

The application will start on `http://localhost:8080`

### 6. Verify Installation

```bash
# Check health
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP","components":{"ollama":{"status":"UP"},"github":{"status":"UP"}}}
```

## ⚙️ GitHub Webhook Setup

### 1. Create GitHub Webhook

1. Go to your repository → **Settings** → **Webhooks** → **Add webhook**
2. Set **Payload URL**: `https://your-domain.com/api/webhooks/github`
3. Set **Content type**: `application/json`
4. Set **Secret**: Use value from `GITHUB_WEBHOOK_SECRET` in `.env`
5. Select events:
   - Pull requests
   - Pull request reviews
6. Click **Add webhook**

### 2. Local Testing with ngrok

For local development, use [ngrok](https://ngrok.com/) to expose your localhost:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 8080

# Use the ngrok URL as your webhook URL
# Example: https://abc123.ngrok.io/api/webhooks/github
```

### 3. Test Webhook

Create a test PR in your repository and check the logs:

```bash
# Watch application logs
tail -f logs/application.log

# You should see:
# Webhook received: pull_request.opened
# Review queued for PR #123
```

## 📖 Usage Examples

### Beginner Mode Review

When you open a PR, OpenReviewAI will post comments like:

```markdown
🐛 **Bug - Medium Severity**

❌ **Problem**: You're accessing `req.body` directly in the service layer (line 42)

💡 **Why this matters**:
Services should be framework-agnostic and not depend on Express-specific objects.
This makes your code harder to test and tightly couples it to the web framework.

✅ **How to fix**:
Move the body parsing logic to the controller layer:

// Controller (framework-specific)
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
    User user = userService.createUser(request);
    return ResponseEntity.ok(user);
}

// Service (framework-agnostic)
public User createUser(CreateUserRequest request) {
    // Business logic here
}

📚 **Learn more**:
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Spring MVC Best Practices](https://spring.io/guides/gs/serving-web-content/)

---
🤖 *Reviewed by OpenReviewAI in Beginner mode*
```

### Senior Mode Review

Same issue, but for experienced developers:

```markdown
⚠️ **Service layer coupling** (line 42)

Framework dependency detected in service. Move to controller.

Severity: Medium

---
🤖 *Reviewed by OpenReviewAI in Senior mode*
```

## 🎨 Review Modes

Configure per-user in the database or set a default in `application.yml`:

```yaml
app:
  review:
    default-mode: beginner  # beginner | intermediate | senior
```

| Mode | Explanation Depth | Examples | Resources | Best For |
|------|------------------|----------|-----------|----------|
| **Beginner** | Detailed | ✅ | ✅ | Students learning to code |
| **Intermediate** | Moderate | ❌ | ✅ | Junior developers |
| **Senior** | Concise | ❌ | ❌ | Experienced developers |

## 🔧 Configuration

### Supported Ollama Models

Edit `OLLAMA_MODEL` in `.env`:

```bash
# Best overall (recommended)
OLLAMA_MODEL=codellama:13b

# Fastest (good for large PRs)
OLLAMA_MODEL=deepseek-coder:6.7b

# Smallest (resource-constrained systems)
OLLAMA_MODEL=codellama:7b

# Most detailed
OLLAMA_MODEL=starcoder2:15b
```

### Review Behavior

Edit `application.yml`:

```yaml
app:
  review:
    max-files-per-review: 50
    timeout: 300000  # 5 minutes
    max-findings-per-file: 10
    ignored-extensions:
      - .json
      - .md
      - .lock
    ignored-paths:
      - node_modules/
      - dist/
      - build/
```

### Rate Limiting

```yaml
app:
  rate-limit:
    enabled: true
    window-ms: 900000      # 15 minutes
    max-requests: 100      # per window
```

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ReviewServiceTest

# Run integration tests only
./mvnw verify -P integration-tests

# Generate coverage report
./mvnw test jacoco:report
# Open target/site/jacoco/index.html
```

### Test Categories

- **Unit Tests**: `src/test/java/.../unit/`
- **Integration Tests**: `src/test/java/.../integration/` (uses Testcontainers)
- **E2E Tests**: `src/test/java/.../e2e/` (full flow with WireMock)

## 📊 Monitoring

### Health Checks

```bash
# Overall health
curl http://localhost:8080/actuator/health

# Detailed health with components
curl http://localhost:8080/actuator/health/details
```

### Metrics

```bash
# Prometheus metrics
curl http://localhost:8080/actuator/prometheus

# Custom review metrics
curl http://localhost:8080/actuator/metrics/review.completed
curl http://localhost:8080/actuator/metrics/review.duration
```

### Logs

```bash
# Application logs
tail -f logs/application.log

# Error logs only
grep ERROR logs/application.log

# Review-specific logs
grep "Review" logs/application.log
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build JAR
./mvnw clean package -DskipTests

# Build Docker image
docker build -t openreview-ai:latest .

# Run container
docker run -p 8080:8080 \
  -e SPRING_PROFILE=prod \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/openreview_ai \
  -e REDIS_HOST=host.docker.internal \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  openreview-ai:latest
```

### Production Deployment

```bash
# Start all services including the app
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale review workers
docker-compose up -d --scale app=3
```

## 📁 Project Structure

```
openreview-ai/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── openreviewai/
│   │   │           │
│   │   │           ├── OpenReviewAiApplication.java
│   │   │           │
│   │   │           ├── config/                    # Configuration
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── RedisConfig.java
│   │   │           │   ├── AsyncConfig.java
│   │   │           │   ├── OllamaConfig.java
│   │   │           │   ├── GitHubConfig.java
│   │   │           │   └── ReviewConfig.java
│   │   │           │
│   │   │           ├── webhook/                   # GitHub Webhooks
│   │   │           │   ├── controller/
│   │   │           │   │   └── GitHubWebhookController.java
│   │   │           │   ├── service/
│   │   │           │   │   ├── WebhookService.java
│   │   │           │   │   └── WebhookValidator.java
│   │   │           │   └── dto/
│   │   │           │       ├── WebhookPayload.java
│   │   │           │       ├── PullRequestEvent.java
│   │   │           │       └── Repository.java
│   │   │           │
│   │   │           ├── github/                    # GitHub Integration
│   │   │           │   ├── client/
│   │   │           │   │   ├── GitHubClient.java
│   │   │           │   │   └── GitHubApiClient.java
│   │   │           │   ├── service/
│   │   │           │   │   ├── PullRequestService.java
│   │   │           │   │   ├── CommentService.java
│   │   │           │   │   └── DiffParserService.java
│   │   │           │   └── dto/
│   │   │           │       ├── PullRequestDto.java
│   │   │           │       ├── DiffDto.java
│   │   │           │       └── FileChangeDto.java
│   │   │           │
│   │   │           ├── llm/                       # LLM Integration
│   │   │           │   ├── client/
│   │   │           │   │   ├── OllamaClient.java
│   │   │           │   │   └── OllamaRestClient.java
│   │   │           │   ├── service/
│   │   │           │   │   ├── LlmService.java
│   │   │           │   │   └── ModelSelector.java
│   │   │           │   └── dto/
│   │   │           │       ├── LlmRequest.java
│   │   │           │       ├── LlmResponse.java
│   │   │           │       └── ModelInfo.java
│   │   │           │
│   │   │           ├── review/                    # Code Review Engine
│   │   │           │   ├── service/
│   │   │           │   │   ├── ReviewService.java
│   │   │           │   │   ├── ReviewOrchestrator.java
│   │   │           │   │   └── AnalysisService.java
│   │   │           │   │
│   │   │           │   ├── analyzer/              # Code Analyzers
│   │   │           │   │   ├── CodeAnalyzer.java  # Interface
│   │   │           │   │   ├── BugAnalyzer.java
│   │   │           │   │   ├── SecurityAnalyzer.java
│   │   │           │   │   ├── CodeSmellAnalyzer.java
│   │   │           │   │   └── BestPracticeAnalyzer.java
│   │   │           │   │
│   │   │           │   ├── rules/                 # Language Rules
│   │   │           │   │   ├── RuleEngine.java
│   │   │           │   │   ├── TypeScriptRules.java
│   │   │           │   │   ├── JavaScriptRules.java
│   │   │           │   │   ├── JavaRules.java
│   │   │           │   │   └── GeneralRules.java
│   │   │           │   │
│   │   │           │   ├── mode/                  # Review Modes
│   │   │           │   │   ├── ReviewMode.java    # Interface
│   │   │           │   │   ├── BeginnerMode.java
│   │   │           │   │   ├── IntermediateMode.java
│   │   │           │   │   └── SeniorMode.java
│   │   │           │   │
│   │   │           │   └── dto/
│   │   │           │       ├── ReviewRequest.java
│   │   │           │       ├── ReviewResult.java
│   │   │           │       ├── Finding.java
│   │   │           │       └── Severity.java
│   │   │           │
│   │   │           ├── prompt/                    # Prompt Engineering
│   │   │           │   ├── builder/
│   │   │           │   │   ├── PromptBuilder.java
│   │   │           │   │   └── TemplateEngine.java
│   │   │           │   ├── template/
│   │   │           │   │   ├── SystemPrompt.java
│   │   │           │   │   ├── ReviewPrompt.java
│   │   │           │   │   ├── BeginnerPrompt.java
│   │   │           │   │   ├── IntermediatePrompt.java
│   │   │           │   │   └── SeniorPrompt.java
│   │   │           │   └── dto/
│   │   │           │       └── PromptContext.java
│   │   │           │
│   │   │           ├── formatter/                 # Output Formatting
│   │   │           │   ├── CommentFormatter.java
│   │   │           │   ├── MarkdownBuilder.java
│   │   │           │   ├── SeverityBadge.java
│   │   │           │   └── ResourceLinker.java
│   │   │           │
│   │   │           ├── queue/                     # Async Processing
│   │   │           │   ├── producer/
│   │   │           │   │   └── ReviewQueueProducer.java
│   │   │           │   ├── consumer/
│   │   │           │   │   └── ReviewQueueConsumer.java
│   │   │           │   ├── job/
│   │   │           │   │   ├── ReviewJob.java
│   │   │           │   │   └── CommentJob.java
│   │   │           │   └── config/
│   │   │           │       └── QueueConfig.java
│   │   │           │
│   │   │           ├── persistence/               # Data Layer
│   │   │           │   ├── entity/
│   │   │           │   │   ├── User.java
│   │   │           │   │   ├── UserSettings.java
│   │   │           │   │   ├── Repository.java
│   │   │           │   │   ├── PullRequest.java
│   │   │           │   │   ├── Review.java
│   │   │           │   │   └── Finding.java
│   │   │           │   │
│   │   │           │   ├── repository/
│   │   │           │   │   ├── UserRepository.java
│   │   │           │   │   ├── RepositoryRepository.java
│   │   │           │   │   ├── PullRequestRepository.java
│   │   │           │   │   ├── ReviewRepository.java
│   │   │           │   │   └── FindingRepository.java
│   │   │           │   │
│   │   │           │   └── enums/
│   │   │           │       ├── ReviewModeEnum.java
│   │   │           │       ├── PRStatus.java
│   │   │           │       ├── ReviewStatus.java
│   │   │           │       ├── FindingType.java
│   │   │           │       └── SeverityLevel.java
│   │   │           │
│   │   │           ├── cache/                     # Caching
│   │   │           │   ├── service/
│   │   │           │   │   ├── CacheService.java
│   │   │           │   │   └── ReviewCacheService.java
│   │   │           │   └── config/
│   │   │           │       └── CacheConfig.java
│   │   │           │
│   │   │           ├── util/                      # Utilities
│   │   │           │   ├── FileFilterUtil.java
│   │   │           │   ├── TokenizerUtil.java
│   │   │           │   ├── DiffParserUtil.java
│   │   │           │   ├── RetryUtil.java
│   │   │           │   └── LoggingUtil.java
│   │   │           │
│   │   │           ├── exception/                 # Exception Handling
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   ├── WebhookException.java
│   │   │           │   ├── GitHubApiException.java
│   │   │           │   ├── LlmException.java
│   │   │           │   └── ReviewException.java
│   │   │           │
│   │   │           ├── security/                  # Security
│   │   │           │   ├── WebhookSignatureValidator.java
│   │   │           │   └── RateLimitFilter.java
│   │   │           │
│   │   │           └── monitoring/                # Observability
│   │   │               ├── metrics/
│   │   │               │   ├── ReviewMetrics.java
│   │   │               │   └── LlmMetrics.java
│   │   │               └── health/
│   │   │                   ├── OllamaHealthIndicator.java
│   │   │                   └── GitHubHealthIndicator.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml                    # Main config
│   │       ├── application-dev.yml                # Dev profile
│   │       ├── application-prod.yml               # Prod profile
│   │       ├── application-test.yml               # Test profile
│   │       │
│   │       ├── db/
│   │       │   └── migration/                     # Flyway migrations
│   │       │       ├── V1__initial_schema.sql
│   │       │       ├── V2__add_user_settings.sql
│   │       │       └── V3__add_findings_index.sql
│   │       │
│   │       ├── prompts/                           # Prompt templates
│   │       │   ├── system.txt
│   │       │   ├── beginner-review.txt
│   │       │   ├── intermediate-review.txt
│   │       │   ├── senior-review.txt
│   │       │   └── templates/
│   │       │       ├── bug.txt
│   │       │       ├── security.txt
│   │       │       └── explanation.txt
│   │       │
│   │       ├── static/                            # Static files (if needed)
│   │       └── templates/                         # Email templates (if needed)
│   │
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── openreviewai/
│       │           ├── unit/                      # Unit tests
│       │           │   ├── service/
│       │           │   ├── analyzer/
│       │           │   └── util/
│       │           │
│       │           ├── integration/               # Integration tests
│       │           │   ├── webhook/
│       │           │   ├── github/
│       │           │   └── repository/
│       │           │
│       │           └── e2e/                       # E2E tests
│       │               └── ReviewFlowTest.java
│       │
│       └── resources/
│           ├── application-test.yml
│           └── fixtures/
│               ├── sample-pr.json
│               ├── sample-diff.txt
│               └── sample-webhook.json
│
├── docker/                                        # Docker files
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
│
├── .github/                                       # GitHub Actions
│   ├── workflows/
│   │   ├── build.yml
│   │   ├── test.yml
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── scripts/                                       # Utility scripts
│   ├── setup-ollama.sh
│   ├── seed-database.sh
│   └── generate-types.sh
│
├── docs/                                          # Documentation
│   ├── architecture.md
│   ├── setup-local.md
│   ├── api-documentation.md
│   ├── deployment.md
│   └── diagrams/
│
├── examples/                                      # Examples
│   ├── sample-review.json
│   └── sample-comments/
│
├── pom.xml                                        # Maven configuration
├── mvnw                                           # Maven wrapper
├── mvnw.cmd
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.dev.yml
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Development Setup:**
```bash
# Install pre-commit hooks
./scripts/setup-hooks.sh

# Run code formatting
./mvnw spotless:apply

# Run linting
./mvnw checkstyle:check
```

## 🐛 Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start Ollama
ollama serve

# Check if model is pulled
ollama list

# Pull model if missing
ollama pull codellama:13b
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Connect to database
docker exec -it openreview-postgres psql -U openreview -d openreview_ai

# Run migrations manually
./mvnw flyway:migrate
```

### Redis Issues

```bash
# Check Redis connection
redis-cli ping
# Expected: PONG

# Clear cache
redis-cli FLUSHALL
```

### GitHub Webhook Issues

```bash
# Check webhook deliveries in GitHub
# Settings → Webhooks → Click webhook → Recent Deliveries

# Validate webhook signature locally
curl -X POST http://localhost:8080/api/webhooks/github \
  -H "X-Hub-Signature-256: sha256=..." \
  -H "X-GitHub-Event: pull_request" \
  -d @test/fixtures/sample-webhook.json
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM runtime
- [Spring Boot](https://spring.io/projects/spring-boot) - Application framework
- [GitHub API](https://docs.github.com/en/rest) - GitHub integration
- All open-source contributors

## 📧 Support

- **Documentation**: comming soon
- **Issues**: [GitHub Issues](https://github.com/yourusername/openreview-ai/issues)
- **Discussions**: Discord server comming soon

---

**Made with ❤️ for students learning to code**

⭐ Star this repo if you find it helpful!

# OpenReview

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-orange?style=for-the-badge)

**AI powered code reviewer that teaches while it reviews**

OpenReview connects your GitHub repository with a local LLM (via Ollama) to automatically review code commits, providing intelligent feedback without sending your code to external cloud AI providers.

## Features

- **Automated Reviews**: Triggers on `git push` events via GitHub Webhooks.
- **Local Intelligence**: URL and Model configuration for Ollama.
- **Database Integration**: Stores repositories and review history using PostgreSQL and Prisma.
- **Privacy Focused**: Your code stays local (or on your private server) and is processed by your own LLM instance.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI Engine**: Ollama (DeepSeek Coder, Llama 3, etc.)

## Prerequisites

- **Node.js** (v18+ recommended)
- **PostgreSQL** database
- **Ollama** running locally or accessible via network
- **ngrok** (optional, for exposing local server to GitHub webhooks during development)

## Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/openreview.git
    cd openreview
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**
    Copy `.env.example` to `.env` and fill in your details:

    ```bash
    cp .env.example .env
    ```

    Edit `.env`:
    - `PORT`: Server port (default 3000)
    - `DATABASE_URL`: Your PostgreSQL connection string.
    - `GITHUB_TOKEN`: GitHub Personal Access Token.
    - `GITHUB_WEBHOOK_SECRET`: Secret key for verifying webhook signatures.
    - `OLLAMA_BASE_URL`: URL of your Ollama instance (default `http://localhost:11434`).
    - `OLLAMA_MODEL`: Model model tag to use (default `deepseek-coder:6.7b`).

4.  **Database Setup**
    Run Prisma migrations to create the database schema:
    ```bash
    npx prisma migrate dev
    ```

## Usage

### Development Server

Run the application in watch mode:

```bash
npm run dev
```

### Production Build

Build and start the application:

```bash
npm run build
npm start
```

### Creating a GitHub Token

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `write:discussion` (for PR comments)
4. Generate and copy the token

### Setting up Webhooks

1.  Expose your local server using ngrok: `ngrok http 3000`.
2.  Go to your GitHub Repository -> Settings -> Webhooks.
3.  Add a new webhook:
    - **Payload URL**: `https://your-ngrok-url.ngrok-free.app/webhook/github`
    - **Content type**: `application/json`
    - **Secret**: The `GITHUB_WEBHOOK_SECRET` from your `.env`.
    - **Events**: Select "Push".

## API Endpoints

- `GET /health`: Health check endpoint.
- `POST /webhook/github`: Endpoint for receiving GitHub push events.

## Example Review Comment

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

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

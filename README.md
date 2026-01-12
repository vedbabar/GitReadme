# GitReadme Generator

The GitReadme Generator is a full-stack, asynchronous service designed to automatically analyze the contents of a remote Git repository and generate a comprehensive, structured `README.md` file using a Large Language Model (LLM).

The architecture separates the fast API gateway from the resource-intensive code analysis and generation process, ensuring high responsiveness and scalability.

## 1. Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend API** | Python, Flask | API Gateway, Request Handling, Rate Limiting |
| **Asynchronous Jobs** | RQ (Redis Queue) | Background task management and job queuing |
| **Database** | SQLModel, PostgreSQL | Persistence for job status, results, and user history |
| **Core Logic** | LangChain, Google Gemini | Repository cloning, file analysis, and LLM orchestration |
| **Frontend** | Next.js, TypeScript | User interface for submission, status polling, and preview |
| **Caching/Queue** | Redis | Job queue management and rate limiting storage |

## 2. Project Structure

The repository is divided into two main components: the Python backend (`api/`) and the Next.js frontend (`frontend/`).

```
.
├── api/
│   ├── config.py           # Operational limits and file filtering rules
│   ├── db.py               # SQLModel engine and session management
│   ├── index.py            # Main Flask API routes and job queuing
│   ├── logic.py            # Core business logic (clone, aggregate, LLM Map/Reduce)
│   ├── models.py           # Database schema (User, Readme)
│   ├── tasks.py            # Asynchronous worker functions (generation, email notification)
│   └── worker.py           # RQ worker process initialization
└── frontend/
    ├── app/
    │   ├── page.tsx        # Main submission page, status polling
    │   └── preview/[id]/page.tsx # Dynamic page for viewing/downloading results
    └── next.config.ts      # Next.js configuration
```

## 3. Key Components

### API Backend

| Module | Role & Key Functionality |
| :--- | :--- |
| `api/index.py` | **API Gateway.** Exposes routes (`/api/generate`, `/api/status`, `/api/history`). Handles IP-based rate limiting (2 jobs/24h) and queues long-running tasks to RQ. |
| `api/logic.py` | **Processing Engine.** Manages the entire workflow: clones the Git repository, aggregates relevant files based on `config.py` rules, and executes the LLM Map/Reduce pattern to generate the final README. |
| `api/tasks.py` | **Asynchronous Handlers.** Defines `background_generate` (calls `logic.py` and updates DB status) and `send_email_notification` (uses `smtplib` for user alerts). |
| `api/config.py` | **Resource Management.** Defines critical constants like `MAX_FILES_TO_SUMMARIZE`, `MAX_CHARS_PER_FILE_SNIPPET`, `CODE_EXTS`, and `DEFAULT_EXCLUDE_DIRS`. |
| `api/worker.py` | **Job Runner.** Dedicated CLI process that connects to Redis and continuously executes tasks from the `'default'` RQ queue. |

### Frontend Client

| Module | Role & Key Functionality |
| :--- | :--- |
| `frontend/app/page.tsx` | **Submission Interface.** Manages user input, initiates generation jobs, and polls the backend status endpoint every 10 seconds. Persists job ID in `localStorage` for continuity. |
| `frontend/app/preview/[id]/page.tsx` | **Result Viewer.** Fetches the final generated content, handles Markdown parsing (via dynamically loaded `marked.js`), and provides copy/download utilities. |

## 4. Setup

This project requires Python 3.9+, Node.js, PostgreSQL, and Redis.

### 4.1. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repo_url>
    cd <repo_name>
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Install Git:** Ensure the `git` command-line tool is installed and accessible, as the `api/logic.py` module relies on it for repository cloning.

### 4.2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install Node dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

## 5. Usage

The application requires three processes running simultaneously: the Database/Redis, the API server, and the RQ worker.

### 5.1. Start Services

Ensure PostgreSQL and Redis are running and accessible via the URLs defined in your environment variables.

### 5.2. Run the API Server

The API server handles HTTP requests and queues jobs. It also initializes the database schema (`init_db`).

```bash
# From the project root directory
python api/index.py
```

### 5.3. Run the Background Worker

The worker executes the heavy, long-running LLM generation tasks.

```bash
# From the project root directory
python api/worker.py
```

### 5.4. Run the Frontend

The Next.js application serves the client interface.

```bash
# From the frontend directory
npm run dev
```

The application will be accessible at `http://localhost:3000` (or the port specified by Next.js).

### API Endpoints Quickstart

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate` | Initiates a new README generation job. Requires `repoUrl` and `userId`. |
| `GET` | `/api/status/<job_id>` | Retrieves the current status (`PENDING`, `COMPLETED`, `FAILED`) and content. |
| `GET` | `/api/history` | Fetches recent job history for a given `userId` (up to 15 records). |

## 6. Configuration

Configuration is managed via environment variables, loaded using `python-dotenv`.

| Name | Purpose | Required | Default |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for PostgreSQL (e.g., `postgresql://user:pass@host/db`). | Yes | None |
| `REDIS_URL` | Connection string for Redis (used by RQ and rate limiting). | Yes | `redis://localhost:6379` |
| `GEMINI_API_KEY` | API key for the Google Gemini LLM service. | Yes | None |
| `SENDER_EMAIL` | Email address for sending completion notifications. | No | None |
| `SENDER_PASSWORD` | App password for the sender email (e.g., Gmail SMTP). | No | None |
| `NEXT_PUBLIC_API_URL` | Frontend URL pointing to the API server (e.g., `http://localhost:5000`). | Yes | None |

## 7. Data Model

The application uses two primary models managed by SQLModel.

### `User`

Manages user identity and API key storage.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Primary key (intended to be set externally). |
| `email` | `str` | Unique indexed email address. |
| `customApiKey` | `str` | Optional custom API key for external services. |
| `createdAt` | `datetime` | Timestamp of creation. |

### `Readme`

Tracks the status and results of each generation job.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for the job. |
| `userId` | `UUID` (FK) | Foreign key linking to the owning user. |
| `repoUrl` | `str` | The Git repository URL processed. |
| `status` | `str` | Current job state (`PENDING`, `COMPLETED`, `FAILED`). |
| `content` | `str` | The final generated Markdown content. |
| `createdAt` | `datetime` | Timestamp of job creation. |

**Relationship:** `Readme` has a many-to-one relationship with `User` via `userId`.

## 8. Deployment

The architecture is highly suitable for containerized deployment (Docker/Kubernetes).

1.  **Containerization:** Dockerize the `api` (Flask server), `worker` (RQ process), and `frontend` (Next.js build).
2.  **Process Separation:** In a production environment, the API server, the RQ worker, PostgreSQL, and Redis must run as separate, persistent services.
3.  **Health Checks:** The `api/worker.py` includes conditional logic to start a lightweight HTTP health check server, useful for cloud platforms (like Render or Heroku) that require a listening port for worker processes.

## 9. Roadmap/Limitations

*   **LLM Integration:** Currently uses Google Gemini. Future plans include supporting other LLMs (e.g., OpenAI, Anthropic) via configuration.
*   **Rate Limiting:** The current rate limit is hardcoded (2 jobs per 24 hours per IP). This should be moved to configuration or managed by a dedicated service layer.
*   **Authentication:** The current `userId` is assumed to be provided externally. Full user authentication (e.g., OAuth, JWT) is a necessary next step.
*   **File Size Limits:** The system strictly enforces limits (`MAX_FILES_TO_SUMMARIZE`, `MAX_CHARS_PER_FILE_SNIPPET`) to prevent excessive resource consumption and manage LLM token limits. Large, complex repositories may be truncated.

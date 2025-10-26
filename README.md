# GitReadme Generator

## 1. Overview

GitReadme is an AI-powered documentation generator designed to automatically analyze the contents of a remote Git repository and synthesize a comprehensive, multi-section README file.

The system uses a robust Map-Reduce pattern orchestrated by the Google Gemini LLM. It handles repository cloning, intelligent file filtering (skipping build artifacts and configuration files), and code snippet summarization to produce accurate, structured documentation covering the project overview, tech stack, setup instructions, and usage.

## 2. Tech Stack

| Component | Technology | Details |
| :--- | :--- | :--- |
| **Backend API** | Python, Flask | Handles routing, input validation, and orchestration. |
| **AI/LLM** | LangChain, Google Gemini | Uses `gemini-2.5-flash-preview-09-2025` for generation. |
| **Repository Handling** | `git-python` | Used for cloning remote repositories into temporary directories. |
| **Frontend** | Next.js (App Router) | Provides the user interface for submitting URLs and viewing results. |
| **Styling/UI** | React (Client Components) | Uses custom fonts (Geist Sans/Mono) and Lucide icons. |

## 3. Project Structure

| Path | Role |
| :--- | :--- |
| `backend/api/config.py` | Defines system constants, file filtering rules (`CODE_EXTS`), and operational limits. |
| `backend/api/index.py` | Flask entry point, API gateway, and health check (`/`, `/api/generate`). |
| `backend/api/logic.py` | Core business logic: repository cloning, code aggregation, and LLM orchestration. |
| `frontend/app/layout.tsx` | Root layout, global metadata ("GitReadme"), and font configuration. |
| `frontend/app/page.tsx` | Main interactive client component (UI for input/results). |
| `frontend/next.config.ts` | Next.js framework configuration. |

## 4. Key Components/Modules

### Backend Logic (`backend/api/logic.py`)

This module is the core engine, implementing the generation workflow:

1.  **Orchestration:** The `clone_and_process_repo` function manages the lifecycle, including temporary directory creation and guaranteed cleanup (`shutil.rmtree`).
2.  **Code Aggregation:** Walks the repository, filtering files based on `CODE_EXTS` and excluding standard directories (`.git`, `venv`, `node_modules`, etc.) defined in `DEFAULT_EXCLUDE_DIRS`.
3.  **Map Step (`summarize_files`):** Generates concise summaries for individual files, focusing on purpose and dependencies. Limited by `MAX_FILES_TO_SUMMARIZE` (120) and `MAX_CHARS_PER_FILE_SNIPPET` (6000).
4.  **Reduce Step (`compose_readme`):** Synthesizes the individual file summaries into a structured, multi-section README document using a detailed prompt template.

### API Gateway (`backend/api/index.py`)

*   Exposes the primary generation endpoint: `POST /api/generate`.
*   Validates that the required `git_url` parameter is present in the request body.
*   Enforces the presence of the `GOOGLE_API_KEY` environment variable.

### Frontend Root (`frontend/app/page.tsx`)

*   The main interactive interface (`'use client'`).
*   Manages the workflow for initiating the generation task and displaying status (using icons like `WandSparkles`, `Brain`, `Loader2`).
*   *Note:* This component also contains hardcoded data related to popular LeetCode coding challenges, suggesting potential future or secondary functionality related to problem-solving documentation.

## 5. Setup

This project requires both Python (for the backend) and Node.js/npm (for the frontend).

### 5.1. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vedbabar/GitReadme
    cd https://github.com/vedbabar/GitReadme/backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    *(Note: Dependencies are inferred from usage of Flask, LangChain, git-python, and python-dotenv)*
    ```bash
    pip install Flask flask-cors python-dotenv gitpython langchain-google-genai langchain-core
    ```

### 5.2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## 6. Usage

### 6.1. Configuration

Create a `.env` file in the `backend/api` directory to store your API key.

### 6.2. Running the Servers

1.  **Start the Backend API (Port 5001):**
    ```bash
    cd backend/api
    python3 index.py
    ```

2.  **Start the Frontend Application (Default Next.js Port 3000):**
    ```bash
    cd frontend
    npm run dev
    ```

### 6.3. API Quickstart

The primary functionality is exposed via the `/api/generate` endpoint.

**Endpoint:** `POST http://localhost:5001/api/generate`

**Request Body (JSON):**
```json
{
  "git_url": "https://github.com/user/repository-name.git"
}
```

**Success Response (200):** Returns the generated README content as text.

## 7. Configuration

Environment variables are loaded via `python-dotenv` in the backend.

| Name | Purpose | Required | Default |
| :--- | :--- | :--- | :--- |
| `GOOGLE_API_KEY` | Authentication key for the Gemini LLM service. | Yes | None |

## 11. Roadmap/Limitations

*   **File Limits:** The system is constrained to process a maximum of **120 files** and truncates individual file snippets at **6,000 characters** to manage LLM context windows and processing time.
*   **Exclusions:** Analysis automatically skips common development and build directories, including `.git`, `venv`, `node_modules`, `dist`, and `target`.
*   **LLM Model:** Currently locked to `gemini-2.5-flash-preview-09-2025` with a low temperature (0.3) for precise, deterministic output.

import os
import shutil
import uuid
import tempfile # <-- IMPORT THIS
from pathlib import Path
from git import Repo
from typing import List, Tuple

from langchain_google_genai import ChatGoogleGenerativeAI # <-- CHANGED
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
# Use the Google Generative AI library
# <-- REMOVED DUPLICATE IMPORT

from .config import CODE_EXTS, DEFAULT_EXCLUDE_DIRS, MAX_FILES_TO_SUMMARIZE, MAX_CHARS_PER_FILE_SNIPPET

def clone_and_process_repo(repo_url: str) -> str:
    """
    Orchestrator function: clones, aggregates code, and generates README.
    This is the main function called by the API route.
    """
    # Use the OS-specific temporary directory
    temp_dir = Path(tempfile.gettempdir()) / str(uuid.uuid4())
    
    try:
        # 1. CLONE REPO (from your git.py logic)
        print(f"Cloning {repo_url} into {temp_dir}")
        Repo.clone_from(repo_url, str(temp_dir))
        
        # 2. AGGREGATE CODE (from your file_crawler.py logic)
        print("Aggregating code files...")
        file_blocks = aggregate_code(temp_dir)
        
        if not file_blocks:
            raise ValueError("No relevant code files found in the repository. Check file extensions and exclude directories.")

        # 3. GENERATE README (from your llm_util.py logic)
        print(f"Found {len(file_blocks)} files. Generating README...")
        LLM = get_llm_model()
        
        # Map step:
        multi_file_summary = summarize_files(LLM, file_blocks)
        
        # Reduce step:
        readme_text = compose_readme(LLM, multi_file_summary)
        
        return readme_text
    
    except Exception as e:
        print(f"Error during processing: {e}")
        # Re-raise the exception so the API handler can catch it
        raise e
        
    finally:
        # Crucial: Clean up the temporary directory *no matter what*
        if temp_dir.exists():
            print(f"Cleaning up directory: {temp_dir}")
            # Add ignore_errors=True to prevent Windows lock errors
            shutil.rmtree(temp_dir, ignore_errors=True)

def aggregate_code(repo_path: Path) -> List[Tuple[str, str]]:
    """
    Walks the repo, filters files, and returns a list of (path, content) tuples.
    This replaces your file_crawler.py and preprocess_file.py
    """
    candidate_files = []
    exclude_dirs_lower = {d.lower() for d in DEFAULT_EXCLUDE_DIRS}

    for dirpath, dirnames, filenames in os.walk(repo_path):
        # Efficiently skip ignored directories
        dirnames[:] = [d for d in dirnames if d.lower() not in exclude_dirs_lower]
        
        for fname in filenames:
            if Path(fname).suffix.lower() in CODE_EXTS:
                file_path = Path(dirpath) / fname
                try:
                    # Get the relative path for the prompt
                    relative_path = file_path.relative_to(repo_path).as_posix()
                    # Read file content
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    candidate_files.append((relative_path, content))
                except Exception:
                    continue # Skip files we can't read or get relative path for
                    
    candidate_files.sort(key=lambda p: p[0].lower())
    return candidate_files

def get_llm_model() -> ChatGoogleGenerativeAI:
    """Configured LLM client."""
    # Switch to the correct model name
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-preview-09-2025",
        api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.3,
    )

# <-- REMOVED 5 EXTRA LINES HERE that were causing the error

def summarize_files(LLM: ChatGoogleGenerativeAI, blocks: List[Tuple[str, str]]) -> str: # <-- CHANGED (type hint)
    """Map step: summarize each file."""
    # This is your exact prompt from llm_util.py
    prompt = PromptTemplate.from_template(
        "You are a precise code summarizer. Summarize the file below for a README.\n"
        "Focus on: purpose, key responsibilities, important functions/classes/exports, routes/CLI, "
        "external deps, and how it fits the project. No code snippets.\n\n"
        "PATH: {path}\n"
        "CONTENT:\n```\n{code}\n```\n\n"
        "Output 9–10 concise bullet points."
    )
    chain = prompt | LLM | StrOutputParser()
    summaries = []
    limit = min(MAX_FILES_TO_SUMMARIZE, len(blocks))
    
    for path, code in blocks[:limit]:
        snippet = code[:MAX_CHARS_PER_FILE_SNIPPET]
        try:
            summary = chain.invoke({"path": path, "code": snippet})
            summaries.append(f"### {path}\n{summary.strip()}\n")
        except Exception as e:
            print(f"Error summarizing {path}: {e}")
            summaries.append(f"### {path}\n- (summary failed: {e})\n")
            
    return "\n".join(summaries)

def compose_readme(LLM: ChatGoogleGenerativeAI, multi_file_summary: str) -> str: # <-- CHANGED (type hint)
    """Reduce step: produce a complete README from file summaries."""
    # This is your exact prompt from llm_util.py
    final_prompt = PromptTemplate.from_template(
        "You will write a high-quality README.md for a repository using the condensed file summaries below.\n"
        "Write concise, actionable documentation without large code blocks. Use fenced blocks only for commands.\n\n"
        "FILE SUMMARIES:\n{summaries}\n\n"
        "Produce README with these sections (only include a section if relevant):\n"
        "1. Overview (what it is and why it exists)\n"
        "2. Tech Stack\n"
        "3. Project Structure (high-level; list major dirs/files and roles)\n"
        "4. Key Components/Modules/Database-Schema (what they do)\n"
        "5. Setup (install) [include information to create virtual env or other way to install the dependency if needed.]\n"
        "6. Usage (run, CLI or API quickstart; sample commands/endpoints)\n"
        "7. Configuration (env vars table: NAME | Purpose | Required | Default)\n"
        "8. Data Model (entities/relations if present)\n"
        "9. Testing (how to run tests)\n"
        "10. Deployment (Docker/CI/CD/cloud hints)\n"
        "11. Roadmap/Limitations\n"
        "Keep it crisp and dev-friendly."
    )
    chain = final_prompt | LLM | StrOutputParser()
    return chain.invoke({"summaries": multi_file_summary})

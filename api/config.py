MAX_FILES_TO_SUMMARIZE = 50        # cap number of files summarized
MAX_CHARS_PER_FILE_SNIPPET = 6000     # truncate each file's content

CODE_EXTS = {
    ".py", ".ipynb", ".js", ".jsx", ".ts", ".tsx",
    ".java", ".kt", ".kts", ".scala",
    ".c", ".cc", ".cpp", ".h", ".hpp",
    ".cs", ".go", ".rs", ".rb", ".php",
    ".swift", ".m", ".mm",
    ".pl", ".sh", ".bash", ".zsh", ".ps1", ".bat",
    ".r", ".jl", ".sql",
    ".html", ".sass", ".xml", ".yml", ".yaml", ".ini", ".gradle"
}

# Common directories to skip 
DEFAULT_EXCLUDE_DIRS = {
    ".git", ".hg", ".svn", "__pycache__", ".idea", ".vscode",
    "node_modules", "venv", ".venv", "env", ".mypy_cache",
    "build", "dist", "target", ".next", ".nuxt", ".pytest_cache", "out", ".toml", ".txt"
}
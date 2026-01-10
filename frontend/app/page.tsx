'use client';

import { useState, useEffect } from 'react';
import {
  Github,
  WandSparkles,
  Loader2,
  Brain,
  ExternalLink,
  Copy,
  Download,
  CheckCircle2,
  Eye,
  Code,
  Moon,
  Sun,
  Mail,
} from 'lucide-react';

interface LeetCodeProblem {
  name: string;
  url: string;
}

const leetCodeProblems: LeetCodeProblem[] = [
  { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
  { name: 'Add Two Numbers', url: 'https://leetcode.com/problems/add-two-numbers/' },
  { name: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { name: 'Median of Two Sorted Arrays', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { name: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { name: 'Reverse Integer', url: 'https://leetcode.com/problems/reverse-integer/' },
  { name: 'String to Integer (atoi)', url: 'https://leetcode.com/problems/string-to-integer-atoi/' },
  { name: 'Palindrome Number', url: 'https://leetcode.com/problems/palindrome-number/' },
  { name: 'Regular Expression Matching', url: 'https://leetcode.com/problems/regular-expression-matching/' },
  { name: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/' },
  { name: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/' },
  { name: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/' },
  { name: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  { name: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { name: 'Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
  { name: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/' },
  { name: '3Sum', url: 'https://leetcode.com/problems/3sum/' },
  { name: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/' },
];

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [readme, setReadme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentProblem, setCurrentProblem] = useState<LeetCodeProblem | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [marked, setMarked] = useState<any>(null);
  
  // --- NEW: Track Job ID for persistence ---
  const [jobId, setJobId] = useState<string | null>(null);

  // --- 1. Load marked.js from CDN ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.marked) {
        // @ts-ignore
        setMarked(() => window.marked);
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

 // --- 2. RESTORE STATE ON REFRESH ---
  useEffect(() => {
    const savedJobId = localStorage.getItem('gitreadme_job_id');
    
    // [ADD THIS BLOCK] ---------------------------
    const savedUrl = localStorage.getItem('gitreadme_url');
    if (savedUrl) setRepoUrl(savedUrl);
    // --------------------------------------------

    if (savedJobId) {
      console.log("🔄 Restoring job from storage:", savedJobId);
      setJobId(savedJobId);
      setIsLoading(true);
      setCurrentProblem(leetCodeProblems[Math.floor(Math.random() * leetCodeProblems.length)]);
    }
  }, []);

  // --- 3. POLLING LOGIC (Effect) ---
  useEffect(() => {
    if (!jobId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Poll every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/status/${jobId}`);
        
        // If server restarted and job is gone (404), clear storage
        if (res.status === 404) {
          console.warn("Job not found on server, clearing storage.");
          localStorage.removeItem('gitreadme_job_id');
          setJobId(null);
          setIsLoading(false);
          setError("Session expired or server restarted. Please try again.");
          clearInterval(interval);
          return;
        }

        const data = await res.json();
        console.log("Polling status:", data.status);

        if (data.status === 'COMPLETED') {
          setReadme(data.content);
          setIsLoading(false);
          setCurrentProblem(null);
          setShowPreview(true);
          // Cleanup
          localStorage.removeItem('gitreadme_job_id');
          setJobId(null);
          clearInterval(interval);
        } else if (data.status === 'FAILED') {
          setError(data.content || 'Generation failed');
          setIsLoading(false);
          setCurrentProblem(null);
          // Cleanup
          localStorage.removeItem('gitreadme_job_id');
          setJobId(null);
          clearInterval(interval);
        }
        // If PENDING, do nothing (interval continues)

      } catch (err) {
        console.error("Polling error:", err);
        // Don't stop polling on network error immediately, wait for next tick
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [jobId]);

  // --- 4. Parser Logic ---
  const parseMarkdown = (markdown: string) => {
    if (!marked || !markdown) return '';
    try {
      marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: true,
        mangle: false,
      });
      return marked.parse(markdown);
    } catch (err) {
      console.error('Markdown parsing error:', err);
      return '<p>Error parsing markdown</p>';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setReadme('');
    setJobId(null);

    const randomProblem = leetCodeProblems[Math.floor(Math.random() * leetCodeProblems.length)];
    setCurrentProblem(randomProblem);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl, email: email }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message||data.error || 'Something went wrong');
      }

      if (data.jobId) {
        // --- SAVE TO STORAGE & STATE ---
        // This triggers the Polling Effect automatically
        setJobId(data.jobId);
        localStorage.setItem('gitreadme_job_id', data.jobId);
        localStorage.setItem('gitreadme_url', repoUrl);
      } else {
        throw new Error("No Job ID returned");
      }

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      setCurrentProblem(null);
    }
  };

  const handleReset = () => {
    setReadme('');
    setRepoUrl('');
    setJobId(null);
    setError('');
    setIsLoading(false);
    localStorage.removeItem('gitreadme_job_id');
    localStorage.removeItem('gitreadme_url');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(readme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([readme], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex min-h-screen w-full flex-col items-center font-sans transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
    } p-6 sm:p-12`}>
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-900/20 opacity-60 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-700/20 opacity-60 blur-3xl"></div>
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-slate-200 opacity-40 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-zinc-200 opacity-40 blur-3xl"></div>
          </>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer hover:scale-110 z-50 ${
          isDark 
            ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
            : 'bg-white hover:bg-gray-100 text-gray-800'
        }`}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Header */}
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-2">
          <div className={`rounded-xl p-2 shadow-lg ${
            isDark 
              ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
              : 'bg-gradient-to-br from-gray-800 to-gray-900'
          }`}>
            <WandSparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            GitReadme
          </h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDark 
              ? 'bg-slate-700 text-slate-200' 
              : 'bg-gray-800 text-white'
          }`}>
            AI-Powered
          </span>
        </div>
        <h2 className={`text-5xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Turn chaos into clarity.
        </h2>
        <p className={`mt-4 max-w-xl text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          Our intelligent companion that helps you transform your GitHub
          repositories into professional, comprehensive documentation.
        </p>
      </header>

      {/* --- Main Content Area: Expanded to max-w-5xl --- */}
      <div className="w-full max-w-5xl">
        
        {/* Form Container: Centered and limited to 2xl so inputs don't stretch too far */}
        <div className={`mx-auto max-w-2xl rounded-lg border p-6 shadow-xl backdrop-blur-sm ${
          isDark 
            ? 'border-slate-700 bg-slate-800/50' 
            : 'border-gray-200 bg-white/80'
        }`}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="repo-url" className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              GitHub Repository URL
            </label>
            <div className="relative flex group mb-4">
              <span className={`inline-flex items-center rounded-l-md border border-r-0 px-3 transition-colors duration-200 ${
                isDark 
                  ? 'border-slate-600 bg-slate-700/50 text-slate-400 group-focus-within:border-slate-500' 
                  : 'border-gray-300 bg-gray-50 text-gray-500 group-focus-within:border-gray-900'
              }`}>
                <Github className="h-5 w-5" />
              </span>
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                required
                className={`block w-full flex-1 rounded-none rounded-r-md border p-3 shadow-sm focus:outline-none transition-all duration-200 sm:text-sm ${
                  isDark 
                    ? 'border-slate-600 bg-slate-700/30 text-white placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20'
                }`}
              />
            </div>

            <label htmlFor="email" className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Email Notification (Optional)
            </label>
            <div className="relative flex group">
              <span className={`inline-flex items-center rounded-l-md border border-r-0 px-3 transition-colors duration-200 ${
                isDark 
                  ? 'border-slate-600 bg-slate-700/50 text-slate-400 group-focus-within:border-slate-500' 
                  : 'border-gray-300 bg-gray-50 text-gray-500 group-focus-within:border-gray-900'
              }`}>
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`block w-full flex-1 rounded-none rounded-r-md border p-3 shadow-sm focus:outline-none transition-all duration-200 sm:text-sm ${
                  isDark 
                    ? 'border-slate-600 bg-slate-700/30 text-white placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-slate-700 text-white hover:bg-slate-600 hover:shadow-lg focus:ring-slate-500 disabled:bg-slate-800 disabled:hover:bg-slate-800' 
                  : 'bg-gray-800 text-white hover:bg-gray-900 hover:shadow-lg focus:ring-gray-500 disabled:bg-gray-400 disabled:hover:bg-gray-400'
              } disabled:hover:shadow-sm`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <WandSparkles className="h-5 w-5" />
                  Generate README
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading / DSA State */}
        {isLoading && currentProblem && (
          <div className={`mt-6 mx-auto max-w-2xl rounded-lg border p-6 text-center shadow-lg ${
            isDark 
              ? 'border-slate-700 bg-gradient-to-br from-slate-800 to-slate-700' 
              : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Loader2 className={`h-6 w-6 animate-spin ${isDark ? 'text-slate-300' : 'text-gray-800'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Generating README...
              </p>
            </div>
            <div className={`inline-block mb-4 h-1.5 w-64 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-600' : 'bg-gray-200'
            }`}>
              <div className={`h-full rounded-full animate-pulse ${
                isDark ? 'bg-slate-400' : 'bg-gray-800'
              }`}></div>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              This can take 2-5 minutes for large repositories.
              <br />
              <span className="font-semibold text-emerald-500">You can refresh this page, I will remember your progress!</span>
              <br />
              <br />
              <span className="font-semibold">While you wait, sharpen your DSA skills!</span>
            </p>
            <a
              href={currentProblem.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] ring-1 ring-inset transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-slate-700 text-white ring-slate-600 hover:bg-slate-600' 
                  : 'bg-white text-gray-900 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              <Brain className="h-5 w-5 text-gray-500" />
              Solve: {currentProblem.name}
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          </div>
        )}

        {error && (
          <div className="mt-6 mx-auto max-w-2xl rounded-lg border border-red-300 bg-red-50 p-4 shadow-lg">
            <div className="flex justify-between items-start">
               <div>
                <p className="text-center font-bold text-red-800">
                  An error occurred:
                </p>
                <p className="mt-2 text-center text-sm text-red-700">{error}</p>
               </div>
               <button onClick={handleReset} className="text-red-600 underline text-sm">Dismiss</button>
            </div>
          </div>
        )}

        {/* Success / Result Area */}
        {readme && !isLoading && (
          <div className="mt-8 w-full">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Your README is ready!
                </h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                   onClick={handleReset}
                   className="text-sm underline text-gray-500 hover:text-gray-700 mr-2"
                >
                  Generate Another
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:shadow-md transition-all duration-200 cursor-pointer ${
                    isDark 
                      ? 'bg-blue-600 text-white hover:bg-blue-500' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {showPreview ? (
                    <><Code className="h-4 w-4" /> Show Code</>
                  ) : (
                    <><Eye className="h-4 w-4" /> Show Preview</>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:shadow-md transition-all duration-200 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-600" /> Copied!</>
                  ) : (
                    <><Copy className="h-4 w-4" /> Copy</>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    isDark 
                      ? 'bg-slate-700 text-white hover:bg-slate-600' 
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  <Download className="h-4 w-4" /> Download .md
                </button>
              </div>
            </div>
            
            {showPreview ? (
              // --- PREVIEW MODE (GitHub Styles) ---
              <div className={`rounded-lg border shadow-xl overflow-hidden ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
              }`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${
                  isDark 
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700' 
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-300 ml-2">README.md - Preview</span>
                  </div>
                </div>
                
                {/* PREVIEW CONTENT - Updated to match PreviewPage */}
                <div className={`p-8 sm:p-12 overflow-auto min-h-[500px] ${
                  isDark ? 'bg-[#0d1117]' : 'bg-white'
                }`}>
                  <style jsx global>{`
                    .markdown-body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
                      font-size: 16px;
                      line-height: 1.6;
                      word-wrap: break-word;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body h1, .markdown-body h2 {
                      font-weight: 600;
                      padding-bottom: 0.3em;
                      border-bottom: 1px solid ${isDark ? '#21262d' : '#d0d7de'};
                      margin-top: 24px;
                      margin-bottom: 16px;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body h1 { font-size: 2em; }
                    .markdown-body h2 { font-size: 1.5em; }
                    .markdown-body h3 { 
                      font-size: 1.25em; 
                      font-weight: 600; 
                      margin-top: 24px; 
                      margin-bottom: 16px;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body h4, .markdown-body h5, .markdown-body h6 { 
                      font-size: 1em; 
                      font-weight: 600; 
                      margin-top: 24px; 
                      margin-bottom: 16px;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body p { 
                      margin-top: 0; 
                      margin-bottom: 16px;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body a { 
                      color: ${isDark ? '#58a6ff' : '#0969da'}; 
                      text-decoration: none; 
                    }
                    .markdown-body a:hover { text-decoration: underline; }
                    .markdown-body code {
                      padding: 0.2em 0.4em;
                      margin: 0;
                      font-size: 85%;
                      background-color: ${isDark ? 'rgba(110,118,129,0.4)' : 'rgba(175,184,193,0.2)'};
                      border-radius: 6px;
                      font-family: ui-monospace, SFMono-Regular, monospace;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body pre {
                      padding: 16px;
                      overflow: auto;
                      font-size: 85%;
                      line-height: 1.45;
                      background-color: ${isDark ? '#161b22' : '#f6f8fa'};
                      border-radius: 6px;
                      margin-bottom: 16px;
                    }
                    .markdown-body pre code {
                      background-color: transparent;
                      padding: 0;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body ul, .markdown-body ol {
                      padding-left: 2em;
                      margin-top: 0;
                      margin-bottom: 16px;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body li {
                      margin-top: 0.25em;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body ul {
                      list-style-type: disc;
                    }
                    .markdown-body ol {
                      list-style-type: decimal;
                    }
                    .markdown-body li::marker {
                      color: ${isDark ? '#8b949e' : '#57606a'};
                    }
                    .markdown-body table {
                      border-spacing: 0;
                      border-collapse: collapse;
                      width: 100%;
                      margin-top: 0;
                      margin-bottom: 16px;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body table th, .markdown-body table td {
                      padding: 6px 13px;
                      border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body table th {
                      font-weight: 600;
                      background-color: ${isDark ? '#161b22' : '#f6f8fa'};
                    }
                    .markdown-body table tr {
                      background-color: ${isDark ? '#0d1117' : '#ffffff'};
                      border-top: 1px solid ${isDark ? '#21262d' : '#d0d7de'};
                    }
                    .markdown-body table tr:nth-child(2n) {
                      background-color: ${isDark ? '#161b22' : '#f6f8fa'};
                    }
                    .markdown-body blockquote {
                      padding: 0 1em;
                      color: ${isDark ? '#8b949e' : '#57606a'};
                      border-left: 0.25em solid ${isDark ? '#30363d' : '#d0d7de'};
                      margin: 0 0 16px 0;
                    }
                    .markdown-body hr {
                      height: 0.25em;
                      padding: 0;
                      margin: 24px 0;
                      background-color: ${isDark ? '#21262d' : '#d0d7de'};
                      border: 0;
                    }
                    .markdown-body img {
                      max-width: 100%;
                      box-sizing: content-box;
                    }
                    .markdown-body strong { 
                      font-weight: 600;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body em { 
                      font-style: italic;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                    .markdown-body del { 
                      text-decoration: line-through;
                      color: ${isDark ? '#c9d1d9' : '#24292f'};
                    }
                  `}</style>
                  <div 
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(readme) }} 
                  />
                </div>
              </div>
            ) : (
              // --- CODE MODE (Raw Text) ---
              <div className={`rounded-lg border shadow-xl overflow-hidden ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'
              }`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${
                  isDark 
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700' 
                    : 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-300 ml-2">README.md</span>
                  </div>
                </div>
                <div className="bg-slate-900 p-6 overflow-auto max-h-[600px]">
                  <pre className="text-sm leading-relaxed">
                    <code className="text-slate-100 whitespace-pre-wrap font-mono">{readme}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
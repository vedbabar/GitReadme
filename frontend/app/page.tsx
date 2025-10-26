'use client';

import { useState } from 'react';
import {
  Github,
  WandSparkles,
  Loader2,
  Brain,
  ExternalLink,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
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
  { name: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { name: 'Longest Repeating Character Replacement', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
  { name: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/' },
  { name: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
  { name: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { name: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
  { name: 'Reorder List', url: 'https://leetcode.com/problems/reorder-list/' },
  { name: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
  { name: 'Find Minimum in Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  { name: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { name: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/' },
  { name: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { name: 'Same Tree', url: 'https://leetcode.com/problems/same-tree/' },
  { name: 'Subtree of Another Tree', url: 'https://leetcode.com/problems/subtree-of-another-tree/' },
  { name: 'Lowest Common Ancestor of a Binary Search Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
  { name: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { name: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  { name: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
  { name: 'Construct Binary Tree from Preorder and Inorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
  { name: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
  { name: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { name: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' },
  { name: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/' },
  { name: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/' },
  { name: 'Pacific Atlantic Water Flow', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
  { name: 'Rotting Oranges', url: 'https://leetcode.com/problems/rotting-oranges/' },
  { name: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/' },
  { name: 'Number of Connected Components in an Undirected Graph', url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
  { name: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/' },
  { name: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/' },
  { name: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  { name: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
  { name: 'Word Break', url: 'https://leetcode.com/problems/word-break/' },
  { name: 'Combination Sum IV', url: 'https://leetcode.com/problems/combination-sum-iv/' },
  { name: 'House Robber', url: 'https://leetcode.com/problems/house-robber/' },
  { name: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/' },
  { name: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways/' },
  { name: 'Unique Paths', url: 'https://leetcode.com/problems/unique-paths/' },
  { name: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/' },
];

const exampleRepos = [
  { name: 'facebook/react', url: 'https://github.com/facebook/react' },
  { name: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
  { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
];

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [readme, setReadme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentProblem, setCurrentProblem] = useState<LeetCodeProblem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setReadme('');

    const randomProblem =
      leetCodeProblems[Math.floor(Math.random() * leetCodeProblems.length)];
    setCurrentProblem(randomProblem);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
      if (!apiUrl) {
        throw new Error('API URL is not configured.');
      }

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ git_url: repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setReadme(data.readme);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setCurrentProblem(null);
    }
  };

  const handleExampleClick = (url: string) => {
    setRepoUrl(url);
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
    <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 sm:p-12 font-sans">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-slate-200 opacity-40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-zinc-200 opacity-40 blur-3xl"></div>
      </div>

      <header className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-2 shadow-lg">
            <WandSparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GitReadme</h1>
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
            AI-Powered
          </span>
        </div>
        <h2 className="text-5xl font-extrabold text-gray-900">
          Turn chaos into clarity.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Our intelligent companion that helps you transform your GitHub
          repositories into professional, comprehensive documentation.
        </p>
      </header>

      <div className="w-full max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
          <div onSubmit={handleSubmit}>
            <label
              htmlFor="repo-url"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              GitHub Repository URL
            </label>
            <div className="relative flex group">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 group-focus-within:border-gray-900 transition-colors duration-200">
                <Github className="h-5 w-5" />
              </span>
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                required
                className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none transition-all duration-200 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-gray-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:hover:shadow-sm transition-all duration-200 cursor-pointer"
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
          </div>

          {/* <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Try these popular repos:</span>
            {exampleRepos.map((repo) => (
              <button
                key={repo.name}
                onClick={() => handleExampleClick(repo.url)}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                {repo.name}
              </button>
            ))}
          </div> */}
        </div>

        {isLoading && currentProblem && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-6 text-center shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Loader2 className="h-6 w-6 animate-spin text-gray-800" />
              <p className="text-lg font-medium text-gray-900">
                Generating README...
              </p>
            </div>
            <div className="inline-block mb-4 h-1.5 w-64 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-800 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              This can take 2-5 minutes for large repositories.
              Please do not reload !!
              <br />
              <span className="font-semibold">While you wait, sharpen your DSA skills!</span>
            </p>
            <a
              href={currentProblem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-md hover:shadow-lg hover:scale-[1.02] ring-1 ring-inset ring-gray-200 transition-all duration-200 cursor-pointer"
            >
              <Brain className="h-5 w-5 text-gray-500" />
              Solve: {currentProblem.name}
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 shadow-lg">
            <p className="text-center font-bold text-red-800">
              An error occurred:
            </p>
            <p className="mt-2 text-center text-sm text-red-700">{error}</p>
          </div>
        )}

        {readme && !isLoading && (
          <div className="mt-8 w-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your README is ready!
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Download .md
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
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
          </div>
        )}
      </div>
    </div>
  );
}
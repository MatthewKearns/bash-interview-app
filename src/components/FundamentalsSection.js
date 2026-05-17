import React, { useState, useCallback } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded
        bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-[#ff6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{label || 'bash'}</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-slate-900 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className="text-orange-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

const TAB_ICONS = {
  variables: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
  conditionals: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  loops: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  functions: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
};

export default function FundamentalsSection({
  fundamentals,
  activeFundamental,
  setActiveFundamental,
}) {
  const active = activeFundamental
    ? fundamentals.find(f => f.id === activeFundamental) || fundamentals[0]
    : fundamentals[0];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bash Fundamentals
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Core concepts with trading operations examples
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl overflow-x-auto">
        {fundamentals.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFundamental(f.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap
              transition-all flex-1 justify-center
              ${active?.id === f.id
                ? 'bg-white dark:bg-slate-800 text-[#ff6900] dark:text-[#fcb900] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
            `}
          >
            <span className={active?.id === f.id ? 'text-[#ff6900]' : ''}>
              {TAB_ICONS[f.id]}
            </span>
            {f.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {active && (
        <div className="space-y-6">
          {active.content.map((section, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff6900]"></span>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {section.subtitle}
                </h3>
              </div>
              <div className="p-5">
                <CodeBlock code={section.code} label={`bash · ${active.title} — ${section.subtitle}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

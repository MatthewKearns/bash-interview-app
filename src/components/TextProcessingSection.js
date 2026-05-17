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

const TOOL_META = {
  grep: {
    color: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    desc: 'Search and filter text using patterns and regular expressions',
    synopsis: 'grep [flags] "pattern" [file...]',
  },
  awk: {
    color: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
    desc: 'Process structured text — extract fields, filter rows, compute aggregates',
    synopsis: 'awk [flags] \'pattern { action }\' [file...]',
  },
  sed: {
    color: 'from-pink-500 to-rose-500',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
    desc: 'Transform text streams — substitute, delete, insert, and reformat',
    synopsis: 'sed [flags] \'command\' [file...]',
  },
};

export default function TextProcessingSection({
  textProcessing,
  activeTextProc,
  setActiveTextProc,
}) {
  const active = activeTextProc
    ? textProcessing.find(t => t.id === activeTextProc) || textProcessing[0]
    : textProcessing[0];

  const meta = active ? TOOL_META[active.id] : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Text Processing
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          grep · awk · sed — the three pillars of bash data analysis
        </p>
      </div>

      {/* Tool selector tabs */}
      <div className="flex gap-3 mb-6">
        {textProcessing.map(tool => {
          const m = TOOL_META[tool.id];
          const isActive = active?.id === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTextProc(tool.id)}
              className={`
                flex-1 p-4 rounded-xl border-2 text-left transition-all
                ${isActive
                  ? 'border-[#ff6900] bg-orange-50 dark:bg-[#ff6900]/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg font-black font-mono ${isActive ? 'text-[#ff6900] dark:text-[#fcb900]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {tool.icon}
                </span>
                {isActive && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${m.badge}`}>
                    active
                  </span>
                )}
              </div>
              <p className={`text-xs leading-snug ${isActive ? 'text-orange-700 dark:text-orange-300' : 'text-slate-400 dark:text-slate-500'}`}>
                {tool.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active tool content */}
      {active && meta && (
        <>
          {/* Tool header */}
          <div className={`rounded-xl p-5 mb-6 bg-gradient-to-br ${meta.color} text-white`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-black font-mono mb-1">{active.icon}</h3>
                <p className="text-white/90 text-sm">{meta.desc}</p>
              </div>
              <div className="font-mono text-xs bg-black/20 px-3 py-2 rounded-lg text-white/80 whitespace-nowrap">
                {meta.synopsis}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-5">
            {active.sections.map((section, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.badge}`}>
                    {i === active.sections.length - 1 ? 'Examples' : i === 0 ? 'Reference' : 'Patterns'}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {section.title}
                  </h3>
                </div>
                <div className="p-5">
                  <CodeBlock code={section.code} label={`bash · ${active.title} — ${section.title}`} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

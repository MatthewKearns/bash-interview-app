import React, { useState, useCallback } from 'react';

function CopyButton({ text, label = 'Copy' }) {
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
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md
        bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white
        transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-[#ff6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-slate-900 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className="text-orange-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

const LEVEL_COLORS = {
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  2: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
};

const CATEGORY_COLORS = {
  'Variables': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  'Redirection': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
  'Pipes': 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
  'Process Management': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  'find': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  'grep': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  'awk': 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
  'sed': 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
  'Pipelines': 'bg-orange-100 text-orange-700 dark:bg-[#ff6900]/20 dark:text-[#fcb900]',
  'Scripting': 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
};

export default function QuestionCard({
  question,
  index,
  isReviewed,
  onToggleReviewed,
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const cardBg = isReviewed
    ? 'bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-900'
    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';

  const categoryColor =
    CATEGORY_COLORS[question.category] ||
    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';

  return (
    <div className={`rounded-xl border ${cardBg} shadow-sm overflow-hidden`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLORS[question.level]}`}>
              L{question.level}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor}`}>
              {question.category}
            </span>
            {isReviewed && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-[#ff6900]/15 dark:text-[#fcb900] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Reviewed
              </span>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Q{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Question title */}
        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white leading-snug">
          {question.title}
        </h3>

        {/* Question body */}
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {question.question}
        </p>

        {/* Action buttons */}
        <div className="mt-4 flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowAnswer(v => !v)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${showAnswer
                ? 'bg-gradient-to-r from-[#ff6900] to-[#fcb900] text-white hover:opacity-90'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={showAnswer
                  ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                  : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
            </svg>
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>

          <button
            onClick={() => setShowCommand(v => !v)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${showCommand
                ? 'bg-slate-700 text-white dark:bg-slate-600'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Try It
          </button>

          <button
            onClick={() => setShowExplanation(v => !v)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${showExplanation
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Context
          </button>

          {/* Mark reviewed (right-aligned) */}
          <label className="ml-auto flex items-center gap-2 cursor-pointer group">
            <span className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">
              Mark reviewed
            </span>
            <div
              onClick={onToggleReviewed}
              className={`
                w-5 h-5 rounded flex items-center justify-center border-2 transition-colors cursor-pointer
                ${isReviewed
                  ? 'bg-[#ff6900] border-[#ff6900]'
                  : 'border-slate-300 dark:border-slate-600 hover:border-[#ff6900]'}
              `}
            >
              {isReviewed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Expandable sections */}
      {showAnswer && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-5 pt-4">
          <CodeBlock code={question.answer} label="bash · Answer" />
          {question.tips && question.tips.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {question.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <svg className="w-3.5 h-3.5 text-[#ff6900] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showCommand && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="w-2 h-2 rounded-full bg-[#ff6900]"></span>
            <span className="ml-2 text-xs text-slate-400 font-mono">terminal — try this</span>
          </div>
          <CodeBlock code={question.command} label="$ bash" />
        </div>
      )}

      {showExplanation && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-5 pt-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Trading Operations Context
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

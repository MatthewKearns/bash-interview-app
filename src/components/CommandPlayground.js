import React, { useState, useRef, useCallback } from 'react';
import { simulate, REGISTRY, QUICK_EXAMPLES } from '../data/commandRegistry';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button onClick={handle} title="Copy"
      className="flex-shrink-0 p-1 rounded text-slate-400 hover:text-[#ff6900] hover:bg-slate-700 transition-all">
      {copied
        ? <svg className="w-3.5 h-3.5 text-[#ff6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      }
    </button>
  );
}

export default function CommandPlayground() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef(null);

  const run = useCallback((cmd) => {
    const raw = (cmd !== undefined ? cmd : input).trim();
    if (!raw) return;
    const res = simulate(raw);
    setResult(res);
    if (raw !== history[0]) setHistory(prev => [raw, ...prev.slice(0, 19)]);
    setHistIdx(-1);
    if (cmd !== undefined) setInput(cmd);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  }, [input, history]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') { run(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      if (history[idx] !== undefined) setInput(history[idx]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : (history[idx] || ''));
    }
  }, [run, histIdx, history]);

  const clear = useCallback(() => { setResult(null); setInput(''); inputRef.current && inputRef.current.focus(); }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Command Playground</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Type any bash command — see what it does, simulated trading output, flags, and pitfalls. No real execution.
        </p>
      </div>

      {/* Terminal input bar */}
      <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-3 mb-4 border border-slate-700 focus-within:border-[#ff6900] transition-colors">
        <span className="font-mono text-[#ff6900] font-bold text-sm select-none flex-shrink-0">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder='grep ERROR trades.log'
          autoFocus
          className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-slate-600 min-w-0"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {result && (
            <button onClick={clear} title="Clear"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button onClick={() => run()}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#ff6900] to-[#fcb900] text-white hover:opacity-90 transition-opacity">
            Run
          </button>
        </div>
      </div>

      {/* Quick-example chips */}
      <div className="flex flex-wrap gap-1.5 mb-6 items-center">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1 flex-shrink-0">Try:</span>
        {QUICK_EXAMPLES.map(ex => (
          <button key={ex} onClick={() => run(ex)}
            className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-[#ff6900]/10 hover:text-[#ff6900] transition-colors whitespace-nowrap">
            {ex.length > 36 ? ex.slice(0, 34) + '…' : ex}
          </button>
        ))}
      </div>

      {/* Unknown command */}
      {result && result.type === 'unknown' && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
            "{result.cmd}" is not in the playground
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Supported commands: {result.suggestions.join(', ')}
          </p>
        </div>
      )}

      {/* Result panels */}
      {result && (result.type === 'result' || result.type === 'pipeline') && (
        <div className="space-y-4">

          {/* Description card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <code className="font-mono font-bold text-[#ff6900] text-base">{result.cmd}</code>
              <code className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {result.synopsis}
              </code>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.description}</p>
            {result.pipelineStages && (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400 mr-1">Pipeline:</span>
                {result.pipelineStages.map((stage, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">|</span>}
                    <code className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {stage}
                    </code>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Output + Flags grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Simulated terminal output */}
            <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-700">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff6900]"></span>
                <span className="ml-2 text-xs text-slate-400 font-mono flex-1">
                  {result.isLive ? 'live output' : 'simulated output · trades.log / trades.csv'}
                  {result.exitCode === 1 && ' · exit 1 (no match)'}
                </span>
                {result.input && <CopyBtn text={result.input} />}
              </div>
              <pre className="bg-slate-900 p-4 text-sm font-mono leading-relaxed overflow-x-auto" style={{ minHeight: '7rem' }}>
                {result.output
                  ? <code className="text-orange-300 whitespace-pre">{result.output}</code>
                  : <code className="text-slate-600 italic">(no output)</code>
                }
              </pre>
              {result.outputNote && (
                <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400 leading-relaxed">{result.outputNote}</p>
                </div>
              )}
            </div>

            {/* Flags reference */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Common Flags</h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 overflow-y-auto" style={{ maxHeight: '16rem' }}>
                {result.flags.map((flag, i) => (
                  <div key={i} className="px-4 py-2 flex items-start gap-3">
                    <code className="text-xs font-mono font-bold text-[#ff6900] flex-shrink-0 mt-0.5 min-w-[4rem]">{flag.f}</code>
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{flag.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pitfalls */}
          {result.pitfalls && result.pitfalls.length > 0 && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Common Pitfalls — Interviewers Ask About These</h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {result.pitfalls.map((p, i) => (
                  <div key={i} className="p-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2.5">{p.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                      <div>
                        <span className="text-xs text-red-500 font-mono font-bold block mb-1">✗ Wrong</span>
                        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg px-2.5 py-1.5">
                          <code className="text-xs font-mono text-red-700 dark:text-red-400 flex-1 min-w-0 whitespace-pre-wrap break-all">{p.wrong}</code>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-[#ff6900] font-mono font-bold block mb-1">✓ Right</span>
                        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-[#ff6900]/10 rounded-lg px-2.5 py-1.5">
                          <code className="text-xs font-mono text-orange-700 dark:text-[#fcb900] flex-1 min-w-0 whitespace-pre-wrap break-all">{p.right}</code>
                          <CopyBtn text={p.right} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="font-mono text-5xl text-slate-200 dark:text-slate-700 mb-4">$_</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Type a command above or click an example to start</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Supports: {Object.keys(REGISTRY).join(' · ')}
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback, useMemo } from 'react';
import { quickRef, proTips, shortcuts } from '../data/content';

function CopyCommandButton({ cmd }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [cmd]);

  return (
    <button
      onClick={handleCopy}
      title="Copy command"
      className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded
        text-slate-400 hover:text-[#ff6900] hover:bg-slate-700 transition-all"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-[#ff6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

const TABS = [
  { id: 'commands', label: 'Commands' },
  { id: 'shortcuts', label: 'Keys' },
  { id: 'tips', label: 'Tips' },
];

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState('commands');
  const [searchCmd, setSearchCmd] = useState('');
  const [openCategories, setOpenCategories] = useState(() =>
    new Set(quickRef.map(c => c.category))
  );

  const toggleCategory = (cat) =>
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  const filteredRef = useMemo(() => {
    if (!searchCmd.trim()) return quickRef;
    const q = searchCmd.toLowerCase();
    return quickRef
      .map(cat => ({
        ...cat,
        commands: cat.commands.filter(
          c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.commands.length > 0);
  }, [searchCmd]);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick Reference
        </h3>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2.5 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-[#ff6900] dark:text-[#fcb900] border-b-2 border-[#ff6900]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* Commands tab */}
        {activeTab === 'commands' && (
          <div>
            {/* Search */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700/50">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchCmd}
                  onChange={e => setSearchCmd(e.target.value)}
                  placeholder="Filter commands..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg
                    border border-slate-200 dark:border-slate-600
                    bg-slate-50 dark:bg-slate-700
                    text-slate-900 dark:text-white placeholder-slate-400
                    focus:outline-none focus:ring-1 focus:ring-[#ff6900]"
                />
              </div>
            </div>

            {/* Command categories */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredRef.map(cat => (
                <div key={cat.category}>
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="w-full flex items-center justify-between px-4 py-2.5
                      text-xs font-semibold text-slate-600 dark:text-slate-300
                      hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.category}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openCategories.has(cat.category) ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openCategories.has(cat.category) && (
                    <div className="pb-2">
                      {cat.commands.map((c, i) => (
                        <div
                          key={i}
                          className="group flex items-start gap-2 px-4 py-1.5
                            hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <code className="text-xs font-mono text-[#ff6900] dark:text-[#fcb900] block truncate">
                              {c.cmd}
                            </code>
                            <span className="text-xs text-slate-400 dark:text-slate-500 leading-tight">
                              {c.desc}
                            </span>
                          </div>
                          <CopyCommandButton cmd={c.cmd} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredRef.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No commands match "{searchCmd}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shortcuts tab */}
        {activeTab === 'shortcuts' && (
          <div className="p-3 space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 px-1">
              Bash readline keyboard shortcuts
            </p>
            {shortcuts.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                  hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {s.desc}
                </span>
                <kbd className="flex-shrink-0 text-xs font-mono font-semibold
                  bg-slate-100 dark:bg-slate-700
                  border border-slate-300 dark:border-slate-600
                  text-slate-700 dark:text-slate-300
                  px-2 py-0.5 rounded whitespace-nowrap">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        )}

        {/* Tips tab */}
        {activeTab === 'tips' && (
          <div className="p-3 space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 px-1">
              Pro tips for production bash scripting
            </p>
            {proTips.map((tip, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 dark:border-slate-700
                  bg-white dark:bg-slate-800 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ff6900]/10 text-[#ff6900] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {tip.tip}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                    {tip.detail}
                  </p>
                  <div className="relative group">
                    <pre className="text-xs font-mono bg-slate-900 text-orange-300 p-2.5 rounded-lg overflow-x-auto leading-relaxed">
                      {tip.example}
                    </pre>
                    <div className="absolute top-1.5 right-1.5">
                      <CopyCommandButton cmd={tip.example} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

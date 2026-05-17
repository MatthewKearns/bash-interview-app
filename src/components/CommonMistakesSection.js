import React, { useState } from 'react';

const MISTAKES = [
  {
    id: 'grep',
    label: 'grep',
    tagColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    headerGradient: 'from-indigo-500 to-blue-500',
    desc: 'Search for patterns in files',
    items: [
      {
        title: 'Unquoted patterns with spaces',
        wrong: 'grep TRADE FAILED trades.log',
        right: 'grep "TRADE FAILED" trades.log',
        why: 'Without quotes, bash word-splits the command. grep sees "FAILED" as a filename — you get "FAILED: No such file or directory", not a search.',
        trap: true,
      },
      {
        title: 'Case-sensitive by default',
        wrong: 'grep error trades.log',
        right: 'grep -i error trades.log',
        why: 'grep is case-sensitive — "error" won\'t match "ERROR" or "Error". Always ask yourself whether case matters.',
        trap: false,
      },
      {
        title: 'Exit code 1 means "no match", not error',
        wrong: 'grep PATTERN file && echo "ok"  # aborts if no match',
        right: 'grep -q PATTERN file; echo "searched"',
        why: 'grep exits 1 when there are no matches. Scripts using && or set -e will treat this as a failure. Use -q to suppress output and check $? separately.',
        trap: true,
      },
      {
        title: '-c vs pipe to wc -l',
        wrong: 'grep ERROR trades.log | wc -l',
        right: 'grep -c ERROR trades.log',
        why: 'Both count matching lines, but grep -c avoids spawning a separate wc process. wc -l is fine in pipelines where grep already runs — but if counting is the only goal, -c is cleaner and faster.',
        trap: false,
      },
    ],
  },
  {
    id: 'cut',
    label: 'cut',
    tagColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    headerGradient: 'from-cyan-500 to-teal-500',
    desc: 'Extract fields from delimited text',
    items: [
      {
        title: 'Default delimiter is TAB, not comma',
        wrong: 'cut -f2 trades.csv',
        right: "cut -d',' -f2 trades.csv",
        why: 'Without -d, cut uses TAB as the delimiter. On a CSV file, every comma is ignored and the entire row is treated as field 1. You get the whole line back.',
        trap: true,
      },
      {
        title: 'Fields are 1-indexed, not 0-indexed',
        wrong: 'cut -d, -f0 trades.csv',
        right: 'cut -d, -f1 trades.csv',
        why: 'cut starts counting at 1. -f0 returns empty output with no error. This trips up anyone used to Python or JavaScript arrays.',
        trap: true,
      },
      {
        title: 'cut cannot filter rows by value',
        wrong: 'cut -d, -f2 trades.csv  # hoping to see only FILLED trades',
        right: "awk -F, '$5 == \"FILLED\" {print $2}' trades.csv",
        why: 'cut can only select columns — it has no pattern matching. If you need to filter rows and select columns simultaneously, reach for awk.',
        trap: false,
      },
      {
        title: 'Quoted delimiter still needs -d',
        wrong: "cut -d , -f2 trades.csv   # space between -d and ,",
        right: "cut -d',' -f2 trades.csv",
        why: 'Some versions of cut accept -d , with a space, but quoting the delimiter (-d\',\') is portable and avoids shell interpretation of special characters like |, ;, \\t.',
        trap: false,
      },
    ],
  },
  {
    id: 'awk',
    label: 'awk',
    tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
    headerGradient: 'from-violet-500 to-purple-500',
    desc: 'Process structured text — fields, filters, math',
    items: [
      {
        title: 'Forgetting NR > 1 skips the CSV header',
        wrong: "awk -F, '{sum += $4} END {print sum}' trades.csv",
        right: "awk -F, 'NR > 1 {sum += $4} END {print sum}' trades.csv",
        why: 'Row 1 is the header "price". awk silently coerces it to 0 — your sum is slightly wrong and the bug is invisible. Always skip the header when doing numeric aggregation.',
        trap: true,
      },
      {
        title: 'String vs numeric comparison',
        wrong: "awk '$3 > \"50\" {print}' trades.csv",
        right: "awk '$3 > 50 {print}' trades.csv",
        why: '"9" > "50" is true lexicographically (because "9" > "5"). Drop the quotes to force numeric comparison. awk auto-detects type based on context.',
        trap: true,
      },
      {
        title: 'Missing action braces',
        wrong: "awk -F, '$5 == \"FILLED\"' trades.csv",
        right: "awk -F, '$5 == \"FILLED\" {print}' trades.csv",
        why: 'Without {}, awk defaults to {print $0} for matching lines. It still works but is ambiguous. Interviewers expect explicit code — always include the action.',
        trap: false,
      },
      {
        title: 'BEGIN/END confusion',
        wrong: "awk 'BEGIN {print $1}' trades.csv  # $1 is empty in BEGIN",
        right: "awk 'BEGIN {print \"Starting...\"} {print $1}' trades.csv",
        why: 'BEGIN runs before any input is read — $1 and other field variables are empty. BEGIN is for initialisation (print headers, set variables), not for processing fields.',
        trap: true,
      },
    ],
  },
  {
    id: 'sort',
    label: 'sort',
    tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    headerGradient: 'from-amber-500 to-orange-500',
    desc: 'Sort lines of text — numeric traps ahead',
    items: [
      {
        title: 'Missing -n for numeric sort',
        wrong: 'echo -e "9\\n10\\n100" | sort',
        right: 'echo -e "9\\n10\\n100" | sort -n',
        why: 'Without -n: output is 10, 100, 9 — lexicographic order (compares char by char). With -n: 9, 10, 100. This is the single most common sort mistake and interviewers love to ask about it.',
        trap: true,
      },
      {
        title: 'uniq without sort first',
        wrong: 'cat symbols.txt | uniq',
        right: 'cat symbols.txt | sort | uniq',
        why: 'uniq only removes adjacent duplicate lines. If the file contains AAPL, MSFT, AAPL — the second AAPL is not adjacent to the first, so both are kept. Sort brings duplicates together first.',
        trap: true,
      },
      {
        title: 'Wrong order for "top N" pipelines',
        wrong: 'sort | uniq -c | sort | head -5   # least frequent first',
        right: 'sort | uniq -c | sort -rn | head -5',
        why: 'Without -rn, sort orders numerically ascending (smallest count first). -r reverses to descending. -n is still required to sort by number, not string. Both flags are needed.',
        trap: false,
      },
      {
        title: 'sort -k without -t for CSV',
        wrong: 'sort -k3 trades.csv   # wrong field',
        right: "sort -t',' -k3 -n trades.csv",
        why: 'Without -t, sort splits on whitespace, so "col1,col2,col3" is one field. Set the delimiter with -t to match your file format.',
        trap: false,
      },
    ],
  },
  {
    id: 'redirection',
    label: 'Redirection',
    tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    headerGradient: 'from-rose-500 to-pink-500',
    desc: 'stdout, stderr, and ordering gotchas',
    items: [
      {
        title: '2>&1 order matters — stderr before stdout redirect',
        wrong: 'cmd 2>&1 > output.log   # stderr still goes to terminal',
        right: 'cmd > output.log 2>&1',
        why: 'Bash evaluates redirects left to right. "2>&1" first means "send stderr where stdout currently points" — at that moment stdout is still the terminal. The > file redirect must come first.',
        trap: true,
      },
      {
        title: '> truncates, >> appends',
        wrong: 'echo "trade 2 complete" > audit.log  # overwrites trade 1',
        right: 'echo "trade 2 complete" >> audit.log',
        why: '> truncates the file to zero bytes before writing. >> appends. In trading audit logs this distinction is critical — always >> for ongoing logs.',
        trap: false,
      },
      {
        title: 'Piping stdin vs file argument',
        wrong: 'cat trades.csv | wc -l  # gives "12 " with extra space',
        right: 'wc -l < trades.csv',
        why: 'cat | wc -l is a useless use of cat and includes the filename in output. Redirect stdin directly: wc -l < trades.csv gives just the number.',
        trap: false,
      },
      {
        title: '/dev/null to silence output',
        wrong: 'cmd > /dev/null  # stderr still appears',
        right: 'cmd > /dev/null 2>&1',
        why: 'Redirecting stdout to /dev/null only silences stdout. Error messages still appear. Add 2>&1 to silence everything, or 2>/dev/null to silence only stderr.',
        trap: false,
      },
    ],
  },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <button onClick={handle} title="Copy"
      className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded text-slate-400 hover:text-[#ff6900] transition-all">
      {copied
        ? <svg className="w-3 h-3 text-[#ff6900]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      }
    </button>
  );
}

export default function CommonMistakesSection() {
  const [active, setActive] = useState(MISTAKES[0].id);
  const section = MISTAKES.find(m => m.id === active) || MISTAKES[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Common Mistakes</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Traps interviewers love to probe — wrong/right pairs with explanations.
        </p>
      </div>

      {/* Command tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl overflow-x-auto">
        {MISTAKES.map(m => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
              transition-all flex-1 justify-center
              ${active === m.id
                ? 'bg-white dark:bg-slate-800 shadow-sm text-[#ff6900] dark:text-[#fcb900]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
            `}
          >
            <code className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${active === m.id ? '' : m.tagColor}`}>
              {m.label}
            </code>
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className={`rounded-xl p-4 mb-5 bg-gradient-to-br ${section.headerGradient} text-white`}>
        <div className="flex items-center gap-3">
          <code className="font-mono font-black text-2xl">{section.label}</code>
          <div>
            <p className="text-white/90 text-sm">{section.desc}</p>
            <p className="text-white/60 text-xs mt-0.5">{section.items.length} common mistakes · {section.items.filter(i => i.trap).length} interview traps</p>
          </div>
        </div>
      </div>

      {/* Mistake cards */}
      <div className="space-y-4">
        {section.items.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex-1">{item.title}</h3>
              {item.trap && (
                <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Interview trap
                </span>
              )}
            </div>

            {/* Code blocks */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-bold text-red-500 font-mono">✗ Wrong</span>
                </div>
                <div className="group rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-2.5 flex items-start gap-2">
                  <code className="text-xs font-mono text-red-700 dark:text-red-400 flex-1 whitespace-pre-wrap break-all leading-relaxed">{item.wrong}</code>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs font-bold text-[#ff6900] font-mono">✓ Right</span>
                </div>
                <div className="group rounded-lg bg-orange-50 dark:bg-[#ff6900]/10 border border-orange-100 dark:border-[#ff6900]/20 px-3 py-2.5 flex items-start gap-2">
                  <code className="text-xs font-mono text-orange-700 dark:text-[#fcb900] flex-1 whitespace-pre-wrap break-all leading-relaxed">{item.right}</code>
                  <CopyBtn text={item.right} />
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="px-4 pb-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                {item.why}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

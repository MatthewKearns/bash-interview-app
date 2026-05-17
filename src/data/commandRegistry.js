// Trading-context sample data used by the playground simulator

const LOGS = [
  '2024-01-15 09:23:41 INFO  Trade submitted: AAPL BUY 100 @ $185.50',
  '2024-01-15 09:23:42 ERROR Trade rejected: TSLA SELL 50 — Insufficient margin',
  '2024-01-15 09:23:43 INFO  Trade confirmed: MSFT BUY 200 @ $374.25',
  '2024-01-15 09:23:44 WARN  Slow response from exchange: NYSE (1247ms)',
  '2024-01-15 09:23:45 ERROR Connection timeout: FIX session dropped',
  '2024-01-15 09:23:46 INFO  Trade submitted: GOOGL SELL 75 @ $142.80',
  '2024-01-15 09:23:47 ERROR Trade rejected: AMZN BUY 30 — Price out of range',
  '2024-01-15 09:23:48 INFO  Position update: AAPL net long 100',
  '2024-01-15 09:23:49 INFO  Trade confirmed: GOOGL SELL 75 @ $142.80',
  '2024-01-15 09:23:50 WARN  Circuit breaker triggered: NVDA',
  '2024-01-15 09:23:51 ERROR DB write failed: positions table locked',
  '2024-01-15 09:23:52 INFO  EOD reconciliation started',
  '2024-01-15 09:23:53 INFO  Trade submitted: META BUY 150 @ $505.20',
  '2024-01-15 09:23:54 ERROR Trade rejected: NVDA SELL 200 — Risk limit exceeded',
  '2024-01-15 09:23:55 INFO  Trade confirmed: META BUY 150 @ $505.20',
  '2024-01-15 09:23:56 INFO  Market closed: NYSE',
  '2024-01-15 09:23:57 INFO  EOD reconciliation complete: 4/7 trades filled',
  '2024-01-15 09:23:58 WARN  Latency spike: execution engine (892ms)',
];

const TRADES_CSV = [
  'timestamp,symbol,quantity,price,status',
  '2024-01-15 09:23:41,AAPL,100,185.50,FILLED',
  '2024-01-15 09:23:42,TSLA,50,245.00,FAILED',
  '2024-01-15 09:23:43,MSFT,200,374.25,FILLED',
  '2024-01-15 09:23:44,AAPL,75,186.00,FILLED',
  '2024-01-15 09:23:45,GOOGL,75,142.80,FILLED',
  '2024-01-15 09:23:46,AMZN,30,178.90,FAILED',
  '2024-01-15 09:23:47,AAPL,50,186.10,PENDING',
  '2024-01-15 09:23:48,TSLA,25,244.50,FILLED',
  '2024-01-15 09:23:49,META,150,505.20,FILLED',
  '2024-01-15 09:23:50,NVDA,200,875.00,FAILED',
  '2024-01-15 09:23:51,MSFT,100,374.00,FILLED',
  '2024-01-15 09:23:52,GOOGL,50,143.10,FILLED',
];

const LS_OUTPUT = [
  'total 392',
  '-rw-r--r-- 1 trader ops  45821 Jan 15 09:58 trades_2024-01-15.csv',
  '-rw-r--r-- 1 trader ops 128543 Jan 15 09:58 trades.log',
  '-rw-r--r-- 1 trader ops  12048 Jan 14 18:30 trades_2024-01-14.csv',
  '-rw-r--r-- 1 trader ops  98234 Jan 14 18:30 trades_2024-01-14.log',
  '-rw-r--r-- 1 trader ops  11982 Jan 13 18:30 trades_2024-01-13.csv',
  '-rw-r--r-- 1 trader ops  87654 Jan 13 18:30 positions.csv',
  '-rwxr-xr-x 1 trader ops   4096 Jan 12 10:00 run_eod.sh',
];

// Tokenizer that respects quoted strings
function tokenize(input) {
  const tokens = [];
  let cur = '';
  let inQ = false;
  let qChar = '';
  for (const ch of input) {
    if (inQ) {
      if (ch === qChar) { inQ = false; }
      else { cur += ch; }
    } else if (ch === '"' || ch === "'") {
      inQ = true; qChar = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (cur) { tokens.push(cur); cur = ''; }
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function parseFlags(args) {
  const flags = new Set();
  const positional = [];
  for (const a of args) {
    if (a.startsWith('-') && a.length > 1 && !/^-\d+$/.test(a)) {
      a.slice(1).split('').forEach(ch => flags.add(ch));
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

// ── Command handlers ─────────────────────────────────────────────────────────

function simGrep(args) {
  const { flags, positional } = parseFlags(args);
  const pattern = (positional[0] || 'ERROR').toUpperCase();
  const file = positional[1] || 'trades.log';
  const isCsv = file.endsWith('.csv');
  const data = isCsv ? TRADES_CSV : LOGS;

  const matches = data.filter(l => l.toUpperCase().includes(pattern));

  if (flags.has('c')) {
    return { output: String(matches.length), note: '-c prints only the count, not the lines. Faster than piping to wc -l.' };
  }
  if (flags.has('l')) {
    return { output: matches.length ? file : '', note: '-l prints only the filename when any match is found.' };
  }
  if (flags.has('v')) {
    const inv = data.filter(l => !l.toUpperCase().includes(pattern));
    const out = flags.has('n')
      ? inv.slice(0, 6).map(l => (data.indexOf(l) + 1) + ':' + l).join('\n')
      : inv.slice(0, 6).join('\n');
    return { output: out, note: '-v inverts the match — shows lines that do NOT contain the pattern.' };
  }
  if (!matches.length) {
    return { output: '', exitCode: 1, note: 'No lines match "' + pattern + '". grep exits code 1 (not an error — just no match). Scripts using set -e may abort.' };
  }
  const out = flags.has('n')
    ? matches.slice(0, 8).map(l => (data.indexOf(l) + 1) + ':' + l).join('\n')
    : matches.slice(0, 8).join('\n');
  const trailer = matches.length > 8 ? '\n... (' + (matches.length - 8) + ' more lines)' : '';
  return { output: out + trailer, note: matches.length + ' line' + (matches.length !== 1 ? 's' : '') + ' match "' + pattern + '" in sample ' + file + '.' };
}

function simTail(args) {
  const { flags } = parseFlags(args);
  if (flags.has('f') || flags.has('F')) {
    return {
      output: LOGS.slice(-4).join('\n') + '\n\n... (following — new lines stream here as trades execute)',
      note: 'tail -f keeps the file open and streams new lines in real time. Ctrl+C to stop. Use -F to survive log rotation.',
      isLive: true,
    };
  }
  let n = 10;
  args.forEach((a, i) => {
    if (/^-(\d+)$/.test(a)) n = parseInt(a.slice(1));
    if ((a === '-n' || a === '--lines') && args[i + 1]) n = parseInt(args[i + 1]);
  });
  const lines = LOGS.slice(-Math.min(n, LOGS.length));
  return { output: lines.join('\n'), note: 'Showing last ' + lines.length + ' lines of sample trades.log.' };
}

function simHead(args) {
  let n = 10;
  args.forEach((a, i) => {
    if (/^-(\d+)$/.test(a)) n = parseInt(a.slice(1));
    if ((a === '-n') && args[i + 1]) n = parseInt(args[i + 1]);
  });
  return { output: LOGS.slice(0, Math.min(n, LOGS.length)).join('\n'), note: 'Showing first ' + Math.min(n, LOGS.length) + ' lines of sample trades.log.' };
}

function simWc(args) {
  const { flags } = parseFlags(args);
  if (flags.has('l')) return { output: '      18 trades.log', note: 'wc -l counts newlines. Redirect stdin (wc -l < file) to get just the number, no filename.' };
  if (flags.has('w')) return { output: '     126 trades.log', note: 'wc -w counts whitespace-separated words.' };
  if (flags.has('c')) return { output: '    1847 trades.log', note: 'wc -c counts bytes.' };
  return { output: '      18     126    1847 trades.log', note: 'Default wc: lines, words, bytes.' };
}

function simCut(args) {
  let delim = '\t';
  let field = 1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-d' && args[i + 1]) { delim = args[i + 1]; i++; continue; }
    if (args[i] === '-f' && args[i + 1]) { field = parseInt(args[i + 1]); i++; continue; }
    const dm = args[i].match(/^-d(.+)$/);
    if (dm) { delim = dm[1]; continue; }
    const fm = args[i].match(/^-f(\d+)$/);
    if (fm) field = parseInt(fm[1]);
  }
  const headers = ['timestamp', 'symbol', 'quantity', 'price', 'status'];
  const fieldName = headers[field - 1] || ('field ' + field);
  const rows = TRADES_CSV.map(row => (row.split(delim)[field - 1] || ''));
  return { output: rows.join('\n'), note: 'Extracted field ' + field + ' (' + fieldName + ') using delimiter "' + (delim === ',' ? 'comma' : delim) + '". Fields are 1-indexed.' };
}

function simAwk(args) {
  const rawArgs = args.join(' ');
  const delimMatch = rawArgs.match(/-F['" ]?([^'" ]+)/);
  const delim = delimMatch ? delimMatch[1] : ' ';

  const printMatch = rawArgs.match(/\{print \$(\d+)\}/);
  const countMatch = rawArgs.match(/\$(\d+)\s*==\s*["']([^'"]+)["']\s*\{count\+\+\}/);
  const nrSkip = /NR\s*[>]\s*1/.test(rawArgs);

  if (countMatch) {
    const idx = parseInt(countMatch[1]) - 1;
    const val = countMatch[2];
    const count = TRADES_CSV.slice(1).filter(r => r.split(delim)[idx] === val).length;
    const headers = ['timestamp', 'symbol', 'quantity', 'price', 'status'];
    return { output: String(count), note: 'Counted ' + count + ' rows where field ' + countMatch[1] + ' (' + (headers[idx] || '?') + ') equals "' + val + '".' };
  }

  if (printMatch) {
    const idx = parseInt(printMatch[1]) - 1;
    const headers = ['timestamp', 'symbol', 'quantity', 'price', 'status'];
    const rows = nrSkip ? TRADES_CSV.slice(1) : TRADES_CSV;
    const out = rows.map(r => r.split(delim)[idx] || '').filter(Boolean).join('\n');
    return { output: out, note: 'Printed field ' + printMatch[1] + ' (' + (headers[idx] || '?') + ') from each row.' + (nrSkip ? ' NR > 1 skips the header.' : '') };
  }

  return { output: TRADES_CSV.slice(0, 5).map(r => r.split(delim).join('\t')).join('\n') + '\n...', note: 'awk processes each line as a record. Fields accessed as $1, $2... Set delimiter with -F.' };
}

function simSort(args) {
  const { flags } = parseFlags(args);
  const data = TRADES_CSV.slice(1).map(r => r.split(',')[1]);
  let sorted;
  const rn = flags.has('r') && flags.has('n');
  if (rn) sorted = [...data].sort((a, b) => parseFloat(b) - parseFloat(a));
  else if (flags.has('n')) sorted = [...data].sort((a, b) => parseFloat(a) - parseFloat(b));
  else if (flags.has('r')) sorted = [...data].sort((a, b) => b.localeCompare(a));
  else sorted = [...data].sort();
  if (flags.has('u')) sorted = [...new Set(sorted)];
  return { output: sorted.join('\n'), note: 'sort buffers ALL input before outputting. Cannot stream. Use -n for numeric, -r to reverse.' };
}

function simLs(args) {
  const { flags } = parseFlags(args);
  if (!flags.has('l')) {
    return { output: 'trades_2024-01-15.csv  trades.log  trades_2024-01-14.csv\ntrades_2024-01-14.log  trades_2024-01-13.csv  positions.csv  run_eod.sh', note: 'Add -l for long format (permissions, owner, size, date).' };
  }
  const hasR = flags.has('r');
  let rows = LS_OUTPUT.slice(1);
  if (hasR) rows = [...rows].reverse();
  const note = (flags.has('t') && hasR)
    ? '-ltr: long format, oldest → newest. Newest file lands at the bottom — immediately visible in the terminal.'
    : flags.has('t') ? '-lt: newest first at the top (can scroll off screen).'
    : 'Long format: permissions | links | owner | group | size | date | name.';
  return { output: [LS_OUTPUT[0], ...rows].join('\n'), note };
}

function simFind(args) {
  let namePattern = '*.csv';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-name' && args[i + 1]) { namePattern = args[i + 1]; break; }
    if (args[i] === '-iname' && args[i + 1]) { namePattern = args[i + 1]; break; }
  }
  const ext = namePattern.replace('*', '');
  const allFiles = [
    '/data/trades/trades_2024-01-15.csv',
    '/data/trades/trades_2024-01-14.csv',
    '/data/trades/trades_2024-01-13.csv',
    '/data/trades/positions.csv',
    '/data/trades/archive/trades_2023-12-31.csv',
    '/data/trades/trades.log',
    '/data/trades/run_eod.sh',
  ];
  const matched = ext ? allFiles.filter(f => f.endsWith(ext)) : allFiles;
  return { output: matched.join('\n'), note: 'find walks the directory tree recursively. Always quote glob patterns: -name "*.csv" not -name *.csv.' };
}

function simSed(args) {
  const rawArgs = args.join(' ');
  const subMatch = rawArgs.match(/s\/([^/]+)\/([^/]*)\/([gi]*)/);
  if (subMatch) {
    const [, find, replace] = subMatch;
    try {
      const re = new RegExp(find, 'g');
      const out = LOGS.slice(0, 5).map(l => l.replace(re, replace)).join('\n');
      return { output: out + '\n...', note: 's/old/new/g replaces ALL occurrences per line. Without /g only the first match per line is replaced.' };
    } catch (e) {
      return { output: '(invalid regex pattern)', note: 'sed uses basic regex by default; use -E for extended regex.' };
    }
  }
  return { output: LOGS.slice(0, 5).join('\n') + '\n...', note: 'sed applies edit commands line-by-line. Most common: s/old/new/flags. -i edits in-place.' };
}

function simEcho(args) {
  const { positional } = parseFlags(args);
  return { output: positional.join(' '), note: 'echo writes its arguments to stdout. Use -e to enable escape sequences (\\n, \\t, etc.).' };
}

function simCat(args) {
  const { positional } = parseFlags(args);
  const file = positional[0] || 'trades.log';
  const isCsv = file.endsWith('.csv');
  const data = isCsv ? TRADES_CSV : LOGS;
  const out = data.slice(0, 8).join('\n') + (data.length > 8 ? '\n...' : '');
  return { output: out, note: 'cat dumps the whole file to stdout at once. For large files prefer tail -n or head -n.' };
}

// Pipeline simulator
function simPipeline(input) {
  const stages = input.split('|').map(s => s.trim());
  const joined = stages.join(' | ');

  // Q9 pattern: extract field → sort → uniq -c → sort -rn → head
  if (/awk.*print.*\|.*sort.*\|.*uniq.*-c.*\|.*sort.*-r.*\|.*head/.test(joined)) {
    const headMatch = joined.match(/head\s*-?n?\s*(\d+)/);
    const printMatch = joined.match(/print \$(\d+)/);
    const n = headMatch ? parseInt(headMatch[1]) : 5;
    const idx = printMatch ? parseInt(printMatch[1]) - 1 : 1;
    const delimMatch = joined.match(/-F['" ]?([^'" ]+)/);
    const delim = delimMatch ? delimMatch[1] : ',';
    const counts = {};
    TRADES_CSV.slice(1).forEach(r => {
      const v = r.split(delim)[idx];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    const out = Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, n)
      .map(([k, v]) => '      ' + v + ' ' + k)
      .join('\n');
    return { output: out, note: 'Classic "top N" pipeline: extract → sort → count unique → sort by count desc → take top N.', pipelineStages: stages };
  }

  // grep | wc -l
  if (stages.length === 2 && stages[0].startsWith('grep') && /wc\s+-l/.test(stages[1])) {
    const grepTokens = tokenize(stages[0]);
    const res = simGrep(grepTokens.slice(1));
    const count = (res.output || '').split('\n').filter(Boolean).length;
    return { output: String(count || 0), note: 'grep filters lines, then wc -l counts them. Equivalent to grep -c, but spawns an extra process.', pipelineStages: stages };
  }

  // sort | uniq variants
  if (/sort.*\|.*uniq/.test(joined)) {
    const withCount = stages.some(s => /uniq\s+-c/.test(s));
    const sorted = [...new Set(TRADES_CSV.slice(1).map(r => r.split(',')[1]).sort())];
    if (withCount) {
      const counts = {};
      TRADES_CSV.slice(1).forEach(r => { const v = r.split(',')[1]; counts[v] = (counts[v] || 0) + 1; });
      const out = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => '      ' + v + ' ' + k).join('\n');
      return { output: out, note: 'uniq -c prefixes each unique line with its count. Must sort first — uniq only removes adjacent duplicates.', pipelineStages: stages };
    }
    return { output: sorted.join('\n'), note: 'sort | uniq removes duplicate lines. uniq alone only removes adjacent duplicates — sort first.', pipelineStages: stages };
  }

  // awk | sort (extract then sort)
  if (stages[0].startsWith('awk') && stages[1] && stages[1].startsWith('sort')) {
    const awkTokens = tokenize(stages[0]);
    const awkResult = simAwk(awkTokens.slice(1));
    const lines = (awkResult.output || '').split('\n').filter(Boolean).sort();
    return { output: lines.join('\n'), note: awkResult.note + ' Then sorted alphabetically.', pipelineStages: stages };
  }

  // Fallback: simulate first stage
  const firstTokens = tokenize(stages[0]);
  const handlers = { grep: simGrep, tail: simTail, head: simHead, awk: simAwk, sort: simSort, cut: simCut, cat: simCat };
  const h = handlers[firstTokens[0]];
  if (h) {
    const res = h(firstTokens.slice(1));
    return { ...res, note: res.note + ' (' + stages.length + '-stage pipeline — stdout flows left-to-right through each |)', pipelineStages: stages };
  }
  return { output: '(pipeline output)', note: stages.length + '-stage pipeline.', pipelineStages: stages };
}

// ── Registry: static metadata for each command ───────────────────────────────

export const REGISTRY = {
  grep: {
    synopsis: 'grep [FLAGS] PATTERN [FILE]',
    description: 'Search for lines matching a pattern. Returns matching lines to stdout. Exit code 0 = match found, 1 = no match, 2 = error. The workhorse of log analysis.',
    flags: [
      { f: '-c', desc: 'Count matching lines (not occurrences)' },
      { f: '-i', desc: 'Case-insensitive matching' },
      { f: '-n', desc: 'Prefix each match with its line number' },
      { f: '-v', desc: 'Invert — print lines that do NOT match' },
      { f: '-r', desc: 'Recurse into subdirectories' },
      { f: '-l', desc: 'Print only filenames that contain a match' },
      { f: '-E', desc: 'Extended regex (same as egrep)' },
      { f: '-q', desc: 'Quiet — no output, just exit code' },
      { f: '-A N', desc: 'Show N lines of context after each match' },
    ],
    pitfalls: [
      { label: 'Unquoted patterns with spaces', wrong: 'grep TRADE FAILED trades.log', right: 'grep "TRADE FAILED" trades.log', why: 'Without quotes, bash treats "FAILED" as a filename — you get "FAILED: No such file or directory".' },
      { label: 'Case-sensitive by default', wrong: 'grep error trades.log', right: 'grep -i error trades.log', why: 'grep misses "ERROR", "Error", "eRROr". Always verify whether case matters.' },
      { label: 'Exit code 1 on no match', wrong: 'grep PATTERN file; echo "done"', right: 'grep -q PATTERN file; echo "done"', why: 'grep exits 1 (failure) when there are no matches. Scripts with set -e will abort unexpectedly.' },
    ],
  },
  tail: {
    synopsis: 'tail [-N | -n N | -f] FILE',
    description: 'Output the last N lines of a file (default 10). With -f, follow the file live as it grows — the standard tool for real-time log monitoring during a trading incident.',
    flags: [
      { f: '-n N', desc: 'Show last N lines (shorthand: -N)' },
      { f: '-f', desc: 'Follow — stream new lines as they are written' },
      { f: '-F', desc: 'Follow by filename — survives log rotation' },
      { f: '-q', desc: 'Quiet — suppress filename headers (multi-file)' },
    ],
    pitfalls: [
      { label: '-f vs -F for log rotation', wrong: 'tail -f app.log', right: 'tail -F app.log', why: 'When logs rotate (app.log → app.log.1, new app.log created), -f follows the old inode. -F reopens by name.' },
      { label: 'Combining with grep', wrong: 'tail -f trades.log | grep --line-buffered ERROR', right: 'tail -f trades.log | grep --line-buffered ERROR', why: 'grep buffers output by default when piped. Add --line-buffered to see matches in real time.' },
    ],
  },
  head: {
    synopsis: 'head [-N | -n N] FILE',
    description: 'Output the first N lines of a file (default 10). Useful for inspecting CSV headers and sampling data before a long pipeline.',
    flags: [
      { f: '-n N', desc: 'Show first N lines' },
      { f: '-c N', desc: 'Show first N bytes' },
    ],
    pitfalls: [
      { label: 'Header row in pipelines', wrong: 'cut -d, -f2 trades.csv | sort | uniq', right: 'tail -n +2 trades.csv | cut -d, -f2 | sort | uniq', why: 'head shows the CSV header "symbol", which then appears in your sorted/unique output as a value.' },
    ],
  },
  wc: {
    synopsis: 'wc [-l | -w | -c] [FILE]',
    description: 'Count lines, words, or bytes. wc -l is the fastest way to count records in a file or pipeline output.',
    flags: [
      { f: '-l', desc: 'Count newlines (lines)' },
      { f: '-w', desc: 'Count whitespace-separated words' },
      { f: '-c', desc: 'Count bytes' },
      { f: '-m', desc: 'Count characters (multibyte-aware)' },
    ],
    pitfalls: [
      { label: 'Output includes filename', wrong: 'count=$(wc -l trades.csv)', right: 'count=$(wc -l < trades.csv)', why: 'wc -l file prints "  12 trades.csv". Redirect stdin to get just the number with no filename.' },
      { label: 'No trailing newline', wrong: 'printf "a\\nb" | wc -l  # gives 1, not 2', right: 'printf "a\\nb\\n" | wc -l  # gives 2', why: 'wc -l counts newlines, not lines. A file missing a trailing newline has one fewer count than expected.' },
    ],
  },
  cut: {
    synopsis: "cut -d DELIM -f N FILE",
    description: 'Extract specific columns from delimited text. Simpler and faster than awk for single-column extraction, but cannot filter rows or handle complex logic.',
    flags: [
      { f: '-d DELIM', desc: 'Field delimiter (default: tab)' },
      { f: '-f N', desc: 'Select field N (1-indexed). Ranges: 1-3 or 2-' },
      { f: '-c N', desc: 'Select by character position' },
    ],
    pitfalls: [
      { label: 'Default delimiter is TAB, not comma', wrong: 'cut -f2 trades.csv', right: "cut -d',' -f2 trades.csv", why: 'Without -d, cut uses tab. On a CSV every comma is ignored and you get the whole line as field 1.' },
      { label: 'Fields are 1-indexed', wrong: 'cut -d, -f0 trades.csv', right: 'cut -d, -f1 trades.csv', why: 'cut starts at field 1. -f0 returns empty output. Catches people used to Python/JS zero-indexing.' },
      { label: 'Cannot filter rows', wrong: 'cut -d, -f5 trades.csv  # to get only FILLED', right: "awk -F, '\$5 == \"FILLED\" {print \$2}' trades.csv", why: 'cut only selects columns — it cannot filter rows by value. Use awk when you need conditions.' },
    ],
  },
  awk: {
    synopsis: "awk -F DELIM 'PATTERN { ACTION }' FILE",
    description: 'A full text-processing language. Splits each line into fields, runs your program on every record. Handles aggregation, math, and conditional logic that grep and cut cannot.',
    flags: [
      { f: '-F DELIM', desc: 'Set input field separator (default: whitespace)' },
      { f: '-v var=val', desc: 'Pass a variable into the awk program' },
      { f: 'NR', desc: 'Built-in: current record number (line count)' },
      { f: 'NF', desc: 'Built-in: number of fields in current record' },
      { f: 'BEGIN{}', desc: 'Runs once before processing any input' },
      { f: 'END{}', desc: 'Runs once after all input is processed' },
    ],
    pitfalls: [
      { label: 'Missing action braces', wrong: "awk -F, '\$5 == \"FILLED\"' trades.csv", right: "awk -F, '\$5 == \"FILLED\" {print}' trades.csv", why: 'Without {}, awk prints the whole line for matches — works but is ambiguous. Always be explicit in interviews.' },
      { label: 'Forgetting NR > 1 for CSV headers', wrong: "awk -F, '{sum += \$4} END {print sum}'", right: "awk -F, 'NR > 1 {sum += \$4} END {print sum}'", why: 'Row 1 is "price" (the header). awk treats it as 0 silently — your aggregate is wrong.' },
      { label: 'String vs numeric comparison', wrong: "awk '\$3 > \"50\"'", right: "awk '\$3 > 50'", why: '"9" > "50" is true lexicographically. Drop the quotes to force numeric comparison.' },
    ],
  },
  sort: {
    synopsis: 'sort [FLAGS] [FILE]',
    description: 'Sort lines of text. Buffers all input before outputting — cannot stream live data. The -n flag is critical: without it, 10 < 9 in lexicographic order.',
    flags: [
      { f: '-n', desc: 'Numeric sort (not lexicographic)' },
      { f: '-r', desc: 'Reverse order (descending)' },
      { f: '-k N', desc: 'Sort by field N' },
      { f: '-t DELIM', desc: 'Field delimiter for -k' },
      { f: '-u', desc: 'Output unique lines only (like sort | uniq)' },
      { f: '-f', desc: 'Case-insensitive sort' },
    ],
    pitfalls: [
      { label: 'Missing -n for numeric sort', wrong: 'echo -e "9\\n10\\n100" | sort', right: 'echo -e "9\\n10\\n100" | sort -n', why: 'Without -n: output is "10, 100, 9" — lexicographic. With -n: "9, 10, 100". Critical for count-then-rank pipelines.' },
      { label: 'sort before uniq', wrong: 'cat symbols.txt | uniq', right: 'cat symbols.txt | sort | uniq', why: 'uniq only removes adjacent duplicates. AAPL, MSFT, AAPL keeps both AAPLs. Always sort first.' },
    ],
  },
  find: {
    synopsis: 'find [PATH] [TESTS] [ACTIONS]',
    description: 'Walk a directory tree and find files matching criteria. Handles recursion, permissions, and timestamps — more powerful than shell globs for large directory trees.',
    flags: [
      { f: '-name "*.csv"', desc: 'Match filename (case-sensitive, always quote)' },
      { f: '-iname', desc: 'Case-insensitive filename match' },
      { f: '-type f', desc: 'Files only (d = directories)' },
      { f: '-mtime -N', desc: 'Modified within last N days' },
      { f: '-maxdepth N', desc: 'Limit recursion depth' },
      { f: '-exec CMD {} \\;', desc: 'Run command on each matched file' },
    ],
    pitfalls: [
      { label: 'Unquoted glob in -name', wrong: 'find /data -name *.csv', right: 'find /data -name "*.csv"', why: 'Without quotes, the shell expands *.csv to files in the current directory before find sees it.' },
      { label: '-exec spawns a process per file', wrong: 'find . -name "*.log" -exec grep ERROR {} \\;', right: 'find . -name "*.log" | xargs grep ERROR', why: '-exec forks a new grep for every file. xargs batches them into one call — much faster at scale.' },
    ],
  },
  sed: {
    synopsis: "sed 's/PATTERN/REPLACEMENT/FLAGS' FILE",
    description: 'Stream editor — applies text transformations line by line. No need to load the whole file. Most often used for in-place substitutions across files.',
    flags: [
      { f: 's/old/new/', desc: 'Substitute first occurrence per line' },
      { f: 's/old/new/g', desc: 'Substitute all occurrences per line' },
      { f: '-i', desc: 'Edit file in-place (Linux). macOS: -i \'\'\'\'' },
      { f: '-n', desc: 'Suppress default output (use with /p)' },
      { f: '-E', desc: 'Extended regex' },
      { f: 'd', desc: 'Delete matching lines' },
    ],
    pitfalls: [
      { label: '-i syntax differs: Linux vs macOS', wrong: "sed -i 's/ERROR/WARN/' file  # macOS fails", right: "sed -i '' 's/ERROR/WARN/' file   # macOS\nsed -i 's/ERROR/WARN/' file      # Linux", why: 'macOS sed requires an explicit backup suffix argument (even empty string). Linux GNU sed does not. Breaks cross-platform scripts.' },
      { label: 'Forgetting /g for global replace', wrong: "sed 's/ERROR/WARN/' file.log", right: "sed 's/ERROR/WARN/g' file.log", why: 'Without /g, only the first match per line is replaced. A line with two ERRORs becomes one WARN one ERROR.' },
    ],
  },
  ls: {
    synopsis: 'ls [FLAGS] [PATH]',
    description: 'List directory contents. The -ltr combination is the production standard for verifying file freshness — newest file appears at the bottom of the terminal.',
    flags: [
      { f: '-l', desc: 'Long format: permissions, owner, size, date' },
      { f: '-t', desc: 'Sort by modification time (newest first)' },
      { f: '-r', desc: 'Reverse order' },
      { f: '-a', desc: 'Show hidden files (dotfiles)' },
      { f: '-h', desc: 'Human-readable sizes (KB, MB)' },
      { f: '-S', desc: 'Sort by file size' },
    ],
    pitfalls: [
      { label: 'Parsing ls output in scripts', wrong: 'for f in $(ls /data/trades/*.csv)', right: 'for f in /data/trades/*.csv', why: 'ls output breaks on filenames with spaces or special chars. Use shell globs directly in scripts.' },
      { label: '-lt vs -ltr', wrong: 'ls -lt   # newest at top', right: 'ls -ltr  # newest at bottom', why: '-lt hides the newest file at the top where it scrolls away. -ltr puts it at the bottom — immediately visible.' },
    ],
  },
  echo: {
    synopsis: 'echo [FLAGS] STRING',
    description: 'Write arguments to stdout. Primarily used in scripts to print messages, variable values, and status updates.',
    flags: [
      { f: '-e', desc: 'Enable escape sequences (\\n, \\t, \\033[...)' },
      { f: '-n', desc: 'Do not append a trailing newline' },
    ],
    pitfalls: [
      { label: 'Use printf for portability', wrong: 'echo -e "line1\\nline2"', right: 'printf "line1\\nline2\\n"', why: 'echo -e behaviour varies across shells and systems. printf is POSIX-standard and consistent everywhere.' },
    ],
  },
  cat: {
    synopsis: 'cat [FLAGS] [FILE...]',
    description: 'Concatenate and print files. Simple for small files, but loading a 10GB log with cat wastes memory — use tail, head, or grep instead.',
    flags: [
      { f: '-n', desc: 'Number all output lines' },
      { f: '-A', desc: 'Show non-printing chars (tabs, line endings)' },
    ],
    pitfalls: [
      { label: 'Useless use of cat', wrong: 'cat file | grep ERROR', right: 'grep ERROR file', why: 'cat | grep spawns an extra process for no reason. grep accepts filenames directly. Interviewers notice this.' },
    ],
  },
};

export const QUICK_EXAMPLES = [
  'grep ERROR trades.log',
  'grep -c ERROR trade_log.txt',
  'tail -20 trades.log',
  'tail -f trades.log',
  'ls -ltr',
  "cut -d',' -f2 trades.csv",
  "awk -F',' '{print $2}' trades.csv",
  "awk -F',' '$5 == \"FILLED\" {count++} END {print count}' trades.csv",
  "awk -F',' '{print $2}' trades.csv | sort | uniq -c | sort -rn | head -5",
  'find /data/trades -name "*.csv"',
  "grep 'FILLED' trades.csv | wc -l",
  'sort symbols.txt | uniq -c',
];

export function simulate(rawInput) {
  if (!rawInput || !rawInput.trim()) return null;
  const input = rawInput.trim();

  if (input.includes('|')) {
    const stages = input.split('|').map(s => s.trim());
    const res = simPipeline(input);
    const firstCmd = tokenize(stages[0])[0];
    const info = REGISTRY[firstCmd] || null;
    return {
      type: 'pipeline',
      cmd: firstCmd || 'pipeline',
      input,
      synopsis: info ? info.synopsis : stages.join(' | '),
      description: info ? info.description : 'Multi-stage pipeline — stdout of each command feeds into the next via the | operator.',
      output: res.output,
      outputNote: res.note,
      isLive: false,
      flags: info ? info.flags : [],
      pitfalls: info ? info.pitfalls : [],
      pipelineStages: res.pipelineStages || stages,
    };
  }

  const tokens = tokenize(input);
  const cmd = tokens[0] ? tokens[0].toLowerCase() : null;
  if (!cmd) return null;

  const handlers = {
    grep: simGrep, tail: simTail, head: simHead, wc: simWc,
    cut: simCut, awk: simAwk, sort: simSort, ls: simLs,
    find: simFind, sed: simSed, echo: simEcho, cat: simCat,
  };

  const info = REGISTRY[cmd];
  const handler = handlers[cmd];

  if (!handler) {
    return { type: 'unknown', cmd, input, suggestions: Object.keys(REGISTRY) };
  }

  const res = handler(tokens.slice(1));
  return {
    type: 'result',
    cmd,
    input,
    synopsis: info.synopsis,
    description: info.description,
    output: res.output,
    outputNote: res.note,
    isLive: res.isLive || false,
    exitCode: res.exitCode,
    flags: info.flags,
    pitfalls: info.pitfalls,
    pipelineStages: null,
  };
}

export const questions = [
  // ── LEVEL 1: FUNDAMENTALS (Q1–Q5) ────────────────────────────────────────
  {
    id: 'q1',
    level: 1,
    section: 'questions',
    category: 'tail',
    title: 'View the Last 20 Lines of a Log File',
    question:
      'How do you view the last 20 lines of a file called trades.log? (Trading logs are huge — you need to see the most recent activity fast.)',
    answer: `# Primary answer
tail -20 trades.log

# Explicit flag form (same result)
tail -n 20 trades.log

# Combine with grep to see only recent errors
tail -100 trades.log | grep ERROR

# Follow live — stream new lines as they appear
tail -f trades.log

# Last 20 lines of multiple files
tail -n 20 trades.log error.log`,
    command: `# View the last 20 lines
tail -20 trades.log

# Live-follow a trading log (Ctrl+C to stop)
tail -f /var/log/trading/live.log`,
    explanation:
      'In trading operations, log files can be gigabytes in size. `tail` jumps straight to the end without reading the whole file — orders of magnitude faster than `cat`. The `-f` (follow) flag is your real-time window into a running trading system, essential for monitoring during market hours.',
    tips: [
      'tail is faster than cat for large files — never cat just to see recent lines',
      'tail -f is live monitoring — follow any actively-written log in real time',
      'tail -n +2 file prints from line 2 onwards (skips CSV header)',
      'Combine with grep: tail -f log | grep ERROR for filtered live monitoring',
    ],
  },
  {
    id: 'q2',
    level: 1,
    section: 'questions',
    category: 'grep',
    title: 'Count ERROR Messages in a Trading Log',
    question:
      'How would you count how many ERROR messages are in trade_log.txt? Show two different methods.',
    answer: `# Method 1: grep -c (count matching lines directly — preferred)
grep -c ERROR trade_log.txt

# Method 2: pipe to wc -l
grep ERROR trade_log.txt | wc -l

# Case-insensitive count
grep -ic error trade_log.txt

# Count errors only from today
grep "$(date +%Y-%m-%d)" trade_log.txt | grep -c ERROR

# Count errors per file across all logs
grep -rc ERROR /var/log/trading/

# Count with line numbers (for investigation)
grep -n ERROR trade_log.txt | wc -l`,
    command: `# Count errors (fastest way)
grep -c ERROR trade_log.txt

# Count and show the lines too
grep -n ERROR trade_log.txt | head -20`,
    explanation:
      'Monitoring error frequency is a core daily task in trading operations. `grep -c` is the preferred one-liner — faster than piping to `wc -l` because it only spawns one process. The `-rc` flag combination (recursive + count) lets you audit error rates across all log files in a directory at once.',
    tips: [
      'grep -c is faster than grep | wc -l — use it for simple counts (one process vs two)',
      'grep -rc dir/ counts matches per file recursively — great for multi-log monitoring',
      'grep returns exit code 0 if match found, 1 if not — useful in if-conditionals',
      '-i makes the search case-insensitive: grep -ic error file',
    ],
  },
  {
    id: 'q3',
    level: 1,
    section: 'questions',
    category: 'ls',
    title: 'List Files Sorted by Most Recently Modified',
    question:
      'How do you list files in a directory sorted by modification time, most recent last? The goal: quickly verify today\'s trade file was updated.',
    answer: `# Most common answer — most recent file appears at BOTTOM of output
ls -ltr

# Flag breakdown:
# -l   long format (shows timestamps, size, permissions, owner)
# -t   sort by modification time (newest first by default)
# -r   reverse the order (so newest appears at bottom — visible in terminal)

# Most recent first (top of output)
ls -lt

# Human-readable file sizes
ls -ltrh

# Only show CSV files, sorted by date
ls -ltr *.csv

# Equivalent with find (handles large directories better)
find /data/trades -type f -printf "%TY-%Tm-%Td %TH:%TM  %p\\n" | sort`,
    command: `# See most recently modified files (newest at bottom)
ls -ltr /data/trades/

# Verify today's trade file exists and was updated today
ls -ltr trades_$(date +%Y%m%d)*.csv`,
    explanation:
      'At the start of each trading day, ops teams verify that overnight batch files (positions, EOD reconciliation, settlement reports) were generated with today\'s timestamps. `ls -ltr` is one of the most-typed commands in trading environments — the most recently modified file appears at the bottom of output, right in view without scrolling.',
    tips: [
      '-ltr is one of the most memorized flag combos: long format, time-sort, reversed',
      'Reverse (-r) is key: newest file is at the bottom — immediately visible in terminal',
      'Add -h for human-readable sizes: ls -ltrh shows "1.2G" instead of byte counts',
      'Use stat file for exact modification timestamps when ls precision is not enough',
    ],
  },
  {
    id: 'q4',
    level: 1,
    section: 'questions',
    category: 'Conditionals',
    title: 'Check if a File Exists Before Processing',
    question:
      'Write a bash conditional to check if /data/positions.csv exists. Show a practical version suitable for a real trading script.',
    answer: `# Basic existence check
if [ -f /data/positions.csv ]; then
    echo "File exists"
else
    echo "File not found"
fi

# Production-quality: check it's a file AND readable
if [ -f /data/positions.csv ] && [ -r /data/positions.csv ]; then
    echo "Validated — processing..."
else
    echo "ERROR: Cannot read /data/positions.csv" >&2
    exit 1
fi

# Common file test operators:
# -e  exists (any type: file, dir, symlink)
# -f  regular file (not a directory or symlink)
# -d  directory
# -r  readable by current user
# -w  writable
# -x  executable
# -s  file exists AND is non-empty (size > 0)

# Compact one-liner
[ -f /data/positions.csv ] && echo "found" || echo "missing"

# Reusable function
require_file() {
    [ -f "$1" ] || { echo "ERROR: $1 not found" >&2; exit 1; }
}
require_file /data/positions.csv`,
    command: `FILE="/data/positions.csv"
if [ -f "$FILE" ] && [ -r "$FILE" ]; then
    echo "OK: $FILE ($(wc -l < "$FILE") lines)"
else
    echo "ERROR: $FILE missing or unreadable" >&2
    exit 1
fi`,
    explanation:
      'Pre-processing validation is critical in trading operations. Processing a missing or corrupt positions file can cause risk calculation errors, missed trades, or compliance failures. Always use `-f` (not `-e`) to confirm it\'s a regular file. Always check `-r` for readability in case of permissions issues. Errors should go to stderr (`>&2`) so they don\'t corrupt piped output.',
    tips: [
      'Use -f not -e: -e matches directories and symlinks too; -f is specific to files',
      'Check -r readability alongside -f — a file can exist but be unreadable (permissions)',
      'Send errors to stderr with >&2 — keep stdout clean for piping',
      'Chain: [ -f "$F" ] && [ -s "$F" ] ensures the file is also non-empty',
    ],
  },
  {
    id: 'q5',
    level: 1,
    section: 'questions',
    category: 'find',
    title: 'Find All CSV Files in a Directory',
    question:
      'Find all CSV files in /data/trades/. Show both approaches and explain why `find` is preferred over the `ls` glob.',
    answer: `# Preferred: find (robust, handles edge cases)
find /data/trades -name "*.csv"

# Also works but has limitations:
ls /data/trades/*.csv

# Why find is preferred:
# 1. Handles directories with thousands of files safely
# 2. Works even when there are zero matching files
# 3. ls *.csv fails with "no matches" if no CSVs exist
# 4. Supports powerful additional filters:

# Files only (exclude directories named *.csv)
find /data/trades -type f -name "*.csv"

# Modified in the last 24 hours
find /data/trades -name "*.csv" -mtime -1

# Modified in the last hour
find /data/trades -name "*.csv" -mmin -60

# Larger than 1MB (potential data quality check)
find /data/trades -name "*.csv" -size +1M

# Execute command on each result
find /data/trades -name "*.csv" -exec wc -l {} +

# Find today's files by name pattern
find /data/trades -name "*$(date +%Y%m%d)*.csv" -type f`,
    command: `# Find all CSVs with their line counts
find /data/trades -type f -name "*.csv" -exec wc -l {} +

# Find CSVs modified in the last hour
find /data/trades -name "*.csv" -mmin -60 -ls`,
    explanation:
      'Post-trade reconciliation and EOD batch processing require reliably locating all relevant files. `ls *.csv` fails if there are zero matches (shell error) or if the glob expands to thousands of filenames (ARG_MAX overflow). `find` is safe in both cases and supports filtering by time, size, and type — critical for trading file management.',
    tips: [
      '-type f excludes directories — always use it to be specific about files',
      '-mmin -60 finds files modified in the last 60 minutes — great for freshness checks',
      '-exec cmd {} + batches results into one command call (faster than {} \\ ;)',
      'find returns exit 0 even with no matches — unlike ls *.csv which errors on zero',
    ],
  },

  // ── LEVEL 2: INTERMEDIATE (Q6–Q10) ───────────────────────────────────────
  {
    id: 'q6',
    level: 2,
    section: 'questions',
    category: 'cut / awk',
    title: 'Extract a Specific Column from a CSV',
    question:
      'You have trades.csv with format: timestamp, symbol, quantity, price, status. Extract just the symbols (column 2). Show both cut and awk approaches.',
    answer: `# Method 1: cut — fastest one-liner for simple extraction
cut -d',' -f2 trades.csv

# Breakdown:
# -d','  set the delimiter to comma
# -f2    extract field 2 (fields are 1-indexed)

# Extract multiple fields
cut -d',' -f2,4 trades.csv        # symbol and price (cols 2, 4)
cut -d',' -f2-4 trades.csv        # cols 2 through 4

# Method 2: awk — more powerful (can filter AND extract)
awk -F',' '{print $2}' trades.csv

# awk with header skip (NR > 1)
awk -F',' 'NR > 1 {print $2}' trades.csv

# awk with conditional filtering
awk -F',' '$5 == "FILLED" {print $2}' trades.csv

# Unique symbols after extraction
cut -d',' -f2 trades.csv | sort -u

# Interview tip: awk is preferred when you also need to filter
# cut is preferred when you just need columns from consistent CSV`,
    command: `# Quick symbol list
cut -d',' -f2 trades.csv

# Unique symbols only
cut -d',' -f2 trades.csv | sort -u

# awk: skip header, print symbol for FILLED trades only
awk -F',' 'NR>1 && $5=="FILLED" {print $2}' trades.csv`,
    explanation:
      'Extracting specific columns is one of the most common data tasks in trading operations — pulling symbols for risk systems, extracting prices for P&L reconciliation, isolating statuses for reporting dashboards. `cut` is the fastest tool for simple field extraction from well-formed CSVs. `awk` is more flexible when you need row filtering combined with column extraction.',
    tips: [
      'cut is faster than awk for pure column extraction — no filtering overhead',
      'awk is better when you need to filter rows AND extract columns simultaneously',
      'NR > 1 in awk skips the header row — essential for CSVs',
      'Combine with sort -u for unique values: cut -d\',\' -f2 file | sort -u',
    ],
  },
  {
    id: 'q7',
    level: 2,
    section: 'questions',
    category: 'grep / awk',
    title: 'Filter and Count Trades by Status',
    question:
      'Count how many trades have status "FILLED" in trades.csv. Show grep and awk approaches and explain which is more efficient for large files.',
    answer: `# Method 1: grep | wc -l
grep "FILLED" trades.csv | wc -l

# Cleaner: grep -c (single process, preferred)
grep -c "FILLED" trades.csv

# Method 2: awk — most efficient for large files
awk -F',' '$5 == "FILLED" {count++} END {print count}' trades.csv

# Performance comparison:
# grep -c      = 1 process
# grep | wc -l = 2 processes + pipe overhead
# awk          = 1 process, handles filtering + counting in one pass

# Count ALL statuses at once (awk wins here)
awk -F',' 'NR > 1 {counts[$5]++}
           END { for (s in counts) print s":", counts[s] }' trades.csv

# Exact field match (avoids matching "FILLED_PARTIAL")
awk -F',' '$5 == "FILLED" {count++} END {print count+0}' trades.csv`,
    command: `# Quick count
grep -c "FILLED" trades.csv

# Count all statuses in one pass
awk -F',' 'NR>1 {counts[$5]++}
END {
  for (s in counts) printf "%-12s %d\\n", s, counts[s]
}' trades.csv | sort`,
    explanation:
      'Counting fills vs failures vs pending orders is a daily post-trade sanity check. The awk solution is the interview-preferred answer for large files — single process, single file pass, no subprocess overhead. The `grep -c` answer is fine for small files and quick checks. Interviewers specifically want to hear you explain the performance tradeoff between the two approaches.',
    tips: [
      'grep -c is cleaner than grep | wc -l — fewer processes, preferred for quick counts',
      'awk is faster on large files: single process, one pass — mention this in the interview',
      'awk accumulator {counts[$5]++} then END{for...} is a key pattern — memorize it',
      'grep can match "FILLED_PARTIAL" when you only want "FILLED" — awk $5 == is exact',
    ],
  },
  {
    id: 'q8',
    level: 2,
    section: 'questions',
    category: 'sort / uniq',
    title: 'Remove Duplicates and Count Frequency',
    question:
      'You have a file with duplicate trading symbols, one per line. Get unique symbols only. Also show how to add a frequency count.',
    answer: `# Remove duplicates (get unique symbols)
sort symbols.txt | uniq

# WHY sort first?
# uniq only removes ADJACENT duplicates
# sort puts identical values next to each other
# Always: sort | uniq — never just uniq alone

# With frequency count (how many times each appeared)
sort symbols.txt | uniq -c

# Output format: "  5 AAPL" (count then value)

# Sorted by frequency, most common first
sort symbols.txt | uniq -c | sort -rn

# Useful uniq flags:
# -c  prefix count
# -d  only print duplicates (appear more than once)
# -u  only print unique lines (appear exactly once)
# -i  case-insensitive comparison

# From a CSV — deduplicate the symbol column
cut -d',' -f2 trades.csv | sort | uniq

# Full pipeline: top 10 most traded symbols
cut -d',' -f2 trades.csv | sort | uniq -c | sort -rn | head -10`,
    command: `# Unique symbols only
sort symbols.txt | uniq

# With frequency count
sort symbols.txt | uniq -c | sort -rn

# From trades CSV, top symbols
cut -d',' -f2 trades.csv | sort | uniq -c | sort -rn | head -10`,
    explanation:
      'Deduplication is constant in trading operations — symbol normalization, position aggregation, feed validation. The `sort | uniq` combination is fundamental bash knowledge. The critical interview point: uniq only removes ADJACENT duplicates, so `sort` must precede it. Candidates who know this detail stand out.',
    tips: [
      'uniq ONLY removes adjacent duplicates — always pipe sort first',
      'uniq -c adds counts — combine with sort -rn for frequency ranking',
      'uniq -d shows only lines that DO have duplicates (appeared more than once)',
      'uniq -u shows only truly unique lines (appeared exactly once)',
    ],
  },
  {
    id: 'q9',
    level: 2,
    section: 'questions',
    category: 'Pipelines',
    title: 'Top 5 Most Frequently Traded Symbols',
    question:
      'Find the top 5 most frequently traded symbols from trades.csv where symbols are in column 2. Show the full pipeline and explain every step — this is a classic interview question.',
    answer: `# THE answer — memorize this pipeline
awk -F',' '{print $2}' trades.csv | sort | uniq -c | sort -rn | head -5

# Step-by-step breakdown (explain each step in the interview):

# Step 1: awk -F',' '{print $2}' trades.csv
#   → Extract column 2 (symbol) from every row

# Step 2: sort
#   → Sort symbols alphabetically
#   → REQUIRED before uniq (uniq only works on adjacent duplicates)

# Step 3: uniq -c
#   → Count consecutive identical symbols
#   → Output: "  42 AAPL  37 GOOGL ..." etc.

# Step 4: sort -rn
#   → -r: reverse order (descending)
#   → -n: numeric sort (so 10 > 9, not "1" < "9")
#   → Highest counts bubble to the top

# Step 5: head -5
#   → Show only the top 5

# Skip header row
awk -F',' 'NR > 1 {print $2}' trades.csv | sort | uniq -c | sort -rn | head -5

# Bonus: pure awk (single process — most efficient)
awk -F',' 'NR>1 { count[$2]++ }
           END  { for (s in count) print count[s], s }' trades.csv \\
  | sort -rn | head -5`,
    command: `# The classic pipeline answer
awk -F',' 'NR>1 {print $2}' trades.csv | sort | uniq -c | sort -rn | head -5`,
    explanation:
      'This is THE canonical bash data analysis pipeline — interviewers in trading operations use it to assess bash fluency. It combines five fundamental commands into a clean one-liner. Walk through each step out loud. The bonus answer (pure awk) is more efficient because it avoids spawning 4 subprocesses, which shows deeper understanding.',
    tips: [
      'Memorize: awk | sort | uniq -c | sort -rn | head — this pattern appears constantly',
      'Walk through each step in the interview — interviewers want to hear your reasoning',
      'sort -rn: -r for descending, -n for numeric sort (critical — without -n, 10 < 9)',
      'Bonus: the awk-only version is more efficient — mention it to stand out',
    ],
  },
  {
    id: 'q10',
    level: 2,
    section: 'questions',
    category: 'Redirection',
    title: 'Redirect Both stdout and stderr to a File',
    question:
      'Run a trading script and save ALL output — both normal output AND error messages — to output.log. Show the syntax and explain how 2>&1 works.',
    answer: `# Method 1: explicit — redirect stdout then merge stderr into it
./trading_bot.sh > output.log 2>&1

# Method 2: shorthand (bash 4+ only)
./trading_bot.sh &> output.log

# How it works:
# >           redirect stdout (file descriptor 1) to output.log
# 2>&1        redirect stderr (fd 2) to wherever fd 1 is NOW pointing
# ORDER IS CRITICAL: 2>&1 must come AFTER the redirect

# WRONG — stderr still goes to terminal:
./trading_bot.sh 2>&1 > output.log  # 2>&1 evaluated BEFORE >, so stderr goes to terminal

# Append mode (use >> in production — never overwrite logs)
./trading_bot.sh >> output.log 2>&1

# Watch output live AND save to file simultaneously
./trading_bot.sh 2>&1 | tee output.log

# Separate stdout and stderr into different files
./trading_bot.sh > stdout.log 2> stderr.log

# Discard stderr (suppress error messages entirely)
./trading_bot.sh > output.log 2>/dev/null`,
    command: `# Run and capture all output
./trading_bot.sh > output.log 2>&1

# Check for issues after
grep -i "error\\|fail\\|exception" output.log | head -20`,
    explanation:
      'When debugging failed trade executions, you need both stdout (trade confirmations, progress messages) and stderr (error messages, exceptions) in the same file for chronological context. Getting `2>&1` order wrong is one of the most common bash mistakes — stderr still goes to the terminal if you write `2>&1 > file` instead of `> file 2>&1`.',
    tips: [
      '2>&1 must come AFTER the file redirect: cmd > file 2>&1 — not 2>&1 > file',
      'Use >> not > for log files in production — appending preserves history',
      '&> is cleaner shorthand for > file 2>&1 but only works in bash 4+',
      'tee lets you watch AND save simultaneously: cmd 2>&1 | tee file.log',
    ],
  },
];


export const fundamentals = [
  {
    id: 'variables',
    title: 'Variables',
    icon: '${...}',
    content: [
      {
        subtitle: 'Declaration & Access',
        code: `# Declaration — no spaces around =
SYMBOL=AAPL
COUNT=42
GREETING="Hello World"
EMPTY=""

# Access — use $VAR or \${VAR}
echo $SYMBOL               # works but risky
echo "\${SYMBOL}"           # best practice — always quote

# Command substitution — capture output of a command
TODAY=$(date +%Y-%m-%d)
LINES=$(wc -l < trades.csv)
USER_HOME=$(eval echo "~$USER")

# Arithmetic
((COUNT++))                # increment
((TOTAL = PRICE * QUANTITY))
RESULT=$((10 + 5 * 2))    # = 20 (respects precedence)`,
      },
      {
        subtitle: 'Special Variables',
        code: `$0   # script name
$1   # first argument
$2   # second argument
$@   # all arguments (as separate words)
$*   # all arguments (as one word)
$#   # number of arguments passed
$?   # exit code of last command (0=success)
$$   # PID of current shell
$!   # PID of last background process
$_   # last argument of previous command

# Example: use $? to check success
grep "ERROR" trades.log
if [ $? -eq 0 ]; then
    echo "Errors found!"
fi`,
      },
      {
        subtitle: 'Parameter Expansion',
        code: `# Default values
\${VAR:-default}      # use default if VAR is unset or empty
\${VAR:=default}      # assign default if VAR is unset or empty
\${VAR:?error msg}    # exit with error if VAR is unset
\${VAR:+alternate}    # use alternate if VAR IS set

# String operations
\${#VAR}              # length of VAR
\${VAR:0:5}           # substring: chars 0-4
\${VAR:(-3)}          # last 3 characters
\${VAR#prefix}        # remove shortest prefix match
\${VAR##prefix}       # remove longest prefix match
\${VAR%suffix}        # remove shortest suffix match
\${VAR%%suffix}       # remove longest suffix match
\${VAR/old/new}       # replace first occurrence
\${VAR//old/new}      # replace all occurrences
\${VAR^^}             # convert to UPPERCASE
\${VAR,,}             # convert to lowercase

# Examples
FILE="trades_2024-05-17.csv"
echo "\${FILE%.csv}"          # trades_2024-05-17
echo "\${FILE##*_}"           # 2024-05-17.csv
echo "\${FILE/2024/2025}"     # trades_2025-05-17.csv`,
      },
      {
        subtitle: 'Arrays',
        code: `# Declare array
SYMBOLS=("AAPL" "GOOGL" "MSFT" "AMZN")

# Access
echo "\${SYMBOLS[0]}"         # AAPL (0-indexed)
echo "\${SYMBOLS[@]}"         # all elements
echo "\${#SYMBOLS[@]}"        # length = 4

# Iterate
for SYMBOL in "\${SYMBOLS[@]}"; do
    echo "Processing: $SYMBOL"
done

# Add element
SYMBOLS+=("TSLA")

# Associative array (bash 4+)
declare -A PRICES
PRICES["AAPL"]=185.50
PRICES["GOOGL"]=140.20
echo "\${PRICES["AAPL"]}"

# Loop associative array
for SYMBOL in "\${!PRICES[@]}"; do
    echo "$SYMBOL: \${PRICES[$SYMBOL]}"
done`,
      },
    ],
  },
  {
    id: 'conditionals',
    title: 'Conditionals',
    icon: 'if/else',
    content: [
      {
        subtitle: 'if / elif / else',
        code: `# Basic structure
if [ condition ]; then
    commands
elif [ other_condition ]; then
    commands
else
    commands
fi

# One-liner
if [ -f "trades.csv" ]; then echo "File exists"; fi

# Prefer [[ ]] over [ ] in bash (more features, safer)
if [[ "$SYMBOL" == "AAPL" ]]; then
    echo "Apple trade detected"
fi`,
      },
      {
        subtitle: 'File Tests',
        code: `[ -e "$FILE" ]    # exists (any type)
[ -f "$FILE" ]    # regular file
[ -d "$DIR" ]     # directory
[ -r "$FILE" ]    # readable
[ -w "$FILE" ]    # writable
[ -x "$FILE" ]    # executable
[ -s "$FILE" ]    # non-empty (size > 0)
[ -L "$FILE" ]    # symbolic link

# Example
if [ ! -f "\${TRADE_FILE}" ]; then
    echo "ERROR: Trade file missing!"
    exit 1
fi`,
      },
      {
        subtitle: 'String & Numeric Tests',
        code: `# String comparisons (use [[ ]])
[[ "$A" == "$B" ]]     # equal
[[ "$A" != "$B" ]]     # not equal
[[ "$A" < "$B" ]]      # less than (lexicographic)
[[ -z "$A" ]]          # empty string
[[ -n "$A" ]]          # non-empty string
[[ "$A" =~ ^[0-9]+$ ]] # regex match

# Numeric comparisons (integers only)
[ "$A" -eq "$B" ]      # equal
[ "$A" -ne "$B" ]      # not equal
[ "$A" -lt "$B" ]      # less than
[ "$A" -gt "$B" ]      # greater than
[ "$A" -le "$B" ]      # less than or equal
[ "$A" -ge "$B" ]      # greater than or equal

# Example: alert on high volume
if [ "$QUANTITY" -gt "$THRESHOLD" ]; then
    echo "HIGH VOLUME ALERT: \${QUANTITY} shares of \${SYMBOL}"
fi`,
      },
      {
        subtitle: 'Compound Conditions',
        code: `# AND / OR in [[ ]]
if [[ -f "$FILE" && -r "$FILE" ]]; then
    echo "File exists and is readable"
fi

if [[ "$STATUS" == "FILLED" || "$STATUS" == "PARTIAL" ]]; then
    echo "Order executed"
fi

# case statement (cleaner than long if/elif chains)
case "$ORDER_STATUS" in
    "FILLED")
        echo "Order complete — sending confirmation"
        ;;
    "REJECTED")
        echo "Order rejected — notify trader"
        send_alert "$ORDER_ID rejected"
        ;;
    "PENDING"|"PARTIAL")
        echo "Order in progress"
        ;;
    *)
        echo "Unknown status: $ORDER_STATUS"
        ;;
esac`,
      },
    ],
  },
  {
    id: 'loops',
    title: 'Loops',
    icon: 'for/while',
    content: [
      {
        subtitle: 'for Loops',
        code: `# Loop over a list
for SYMBOL in AAPL GOOGL MSFT AMZN; do
    echo "Processing: $SYMBOL"
done

# Loop over a range
for i in {1..10}; do
    echo "Attempt $i"
done

# Loop with step
for i in {0..100..5}; do   # 0, 5, 10, ..., 100
    echo "$i"
done

# C-style loop
for ((i=0; i<10; i++)); do
    echo "Count: $i"
done

# Loop over files
for FILE in /data/trades/*.csv; do
    echo "Processing: $FILE"
    wc -l "$FILE"
done

# Loop over array
SYMBOLS=("AAPL" "GOOGL" "MSFT")
for SYMBOL in "\${SYMBOLS[@]}"; do
    grep "$SYMBOL" trades.log | wc -l
done`,
      },
      {
        subtitle: 'while & until Loops',
        code: `# while loop
COUNT=0
while [ $COUNT -lt 10 ]; do
    echo "Count: $COUNT"
    ((COUNT++))
done

# Read file line by line (BEST PRACTICE for CSVs)
while IFS=',' read -r DATE SYMBOL SIDE QTY PRICE STATUS; do
    if [[ "$STATUS" == "REJECTED" ]]; then
        echo "Rejected: $SYMBOL qty=$QTY"
    fi
done < trades.csv

# until loop (runs UNTIL condition becomes true)
CONNECTED=false
until $CONNECTED; do
    ping -c 1 trading-server > /dev/null 2>&1 \\
        && CONNECTED=true \\
        || echo "Waiting for connection..."
    sleep 5
done
echo "Connected!"

# Infinite loop with break
while true; do
    if pgrep "trading-engine" > /dev/null; then
        echo "Engine alive"
    else
        echo "Engine DOWN — restarting"
        break
    fi
    sleep 30
done`,
      },
      {
        subtitle: 'Loop Control',
        code: `# break — exit loop early
for SYMBOL in "\${SYMBOLS[@]}"; do
    if [[ "$SYMBOL" == "STOP" ]]; then
        break
    fi
    echo "Processing: $SYMBOL"
done

# continue — skip to next iteration
for FILE in /logs/*.log; do
    if [[ "$FILE" == *"debug"* ]]; then
        continue    # skip debug logs
    fi
    grep "ERROR" "$FILE"
done

# Loop with index
SYMBOLS=("AAPL" "GOOGL" "MSFT")
for i in "\${!SYMBOLS[@]}"; do
    echo "$((i+1)). \${SYMBOLS[$i]}"
done`,
      },
    ],
  },
  {
    id: 'functions',
    title: 'Functions',
    icon: 'fn()',
    content: [
      {
        subtitle: 'Declaration & Calling',
        code: `# Declaration syntax (both are valid)
function check_process {
    echo "Checking: $1"
}

check_process() {
    echo "Checking: $1"
}

# Call — just use the name
check_process "trading-engine"

# Arguments: $1, $2, ... $@ (same as script args)
greet_trader() {
    local NAME="$1"
    local DESK="\${2:-Unknown Desk}"
    echo "Welcome, \${NAME} from \${DESK}"
}

greet_trader "Alice" "Equities"
greet_trader "Bob"              # uses default "Unknown Desk"`,
      },
      {
        subtitle: 'Return Values & Exit Codes',
        code: `# return N sets exit code ($?), not a value
# To return a value, echo it and capture with $()
is_market_open() {
    local HOUR=$(date +%H)
    if [ "$HOUR" -ge 9 ] && [ "$HOUR" -lt 16 ]; then
        return 0    # true — market open
    else
        return 1    # false — market closed
    fi
}

get_trade_count() {
    local FILE="$1"
    local COUNT=$(grep -c "FILLED" "$FILE" 2>/dev/null || echo 0)
    echo "$COUNT"   # "return" via stdout
}

# Using the functions
if is_market_open; then
    echo "Market is OPEN"
fi

COUNT=$(get_trade_count "trades.csv")
echo "Filled trades: $COUNT"`,
      },
      {
        subtitle: 'Local Variables & Best Practices',
        code: `# Always use local for function variables
log() {
    local LEVEL="\${1:-INFO}"
    local MESSAGE="$2"
    local TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[\${TIMESTAMP}] [\${LEVEL}] \${MESSAGE}"
}

# Real-world example: trade file validator
validate_trade_file() {
    local FILE="$1"
    local MIN_LINES="\${2:-100}"     # expect at least 100 trades
    local ERRORS=0

    if [ ! -f "$FILE" ]; then
        log "ERROR" "File not found: $FILE"
        return 1
    fi

    local LINE_COUNT=$(wc -l < "$FILE")
    if [ "$LINE_COUNT" -lt "$MIN_LINES" ]; then
        log "WARN" "Only $LINE_COUNT lines (expected $MIN_LINES+)"
        ((ERRORS++))
    fi

    if grep -q "CORRUPT" "$FILE"; then
        log "ERROR" "Corrupt records found in $FILE"
        ((ERRORS++))
    fi

    return $ERRORS
}

validate_trade_file "trades.csv" 500
echo "Validation exit code: $?"`,
      },
    ],
  },
];

export const textProcessing = [
  {
    id: 'grep',
    title: 'grep',
    subtitle: 'Global Regular Expression Print',
    icon: 'grep',
    sections: [
      {
        title: 'Flags Reference',
        code: `grep [flags] "pattern" [file...]

-i       # case-insensitive match
-v       # invert — lines NOT matching
-n       # show line numbers
-c       # count matching lines (not the lines themselves)
-l       # list filenames that contain a match
-L       # list filenames that do NOT contain a match
-r / -R  # recursive search through directories
-E       # extended regex (enables |, +, ?, {n,m})
-P       # Perl-compatible regex (enables \\d, \\w, lookaheads)
-o       # print only the matched portion
-w       # match whole word only
-x       # match whole line only
-A N     # N lines After each match
-B N     # N lines Before each match
-C N     # N lines around (Context) each match
-m N     # stop after N matches
--color  # highlight matches (usually on by default)`,
      },
      {
        title: 'Regex Cheat Sheet',
        code: `# Anchors
^pattern        # starts with pattern
pattern$        # ends with pattern
^pattern$       # exact line match

# Character classes
[0-9]           # any digit
[a-zA-Z]        # any letter
[ABCDE]         # A, B, C, D, or E
[^0-9]          # NOT a digit

# Quantifiers (with -E)
pattern?        # 0 or 1 times
pattern+        # 1 or more times
pattern*        # 0 or more times
pattern{3}      # exactly 3 times
pattern{3,}     # 3 or more times
pattern{3,6}    # 3 to 6 times

# Special
.               # any character (except newline)
\\.             # literal dot (escaped)
(A|B)           # A or B (with -E)
\\b             # word boundary (with -P)`,
      },
      {
        title: 'Trading Ops Examples',
        code: `# Find all errors in today's logs
grep "$(date +%Y-%m-%d)" /var/log/trading/*.log | grep -i "error\\|reject\\|fail"

# Count rejections per log file
grep -rc "REJECTED" /var/log/trading/

# Find FIX rejected orders (OrdStatus=8)
grep -E "OrdStatus=8" fix_$(date +%Y%m%d).log

# Extract specific FIX tags
grep -oE "Symbol=[A-Z]+" fix.log | sort | uniq -c

# Find large trades (5+ digit quantity)
grep -E "qty=[1-9][0-9]{4,}" trades.log

# Search across compressed logs
zgrep "ERROR" /var/log/trading/archive/*.gz

# Show context around errors
grep -C 3 "FATAL" trading_engine.log | head -50

# Find lines NOT containing DEBUG (clean view)
grep -v "DEBUG" trading.log | grep -v "TRACE"`,
      },
    ],
  },
  {
    id: 'awk',
    title: 'awk',
    subtitle: 'Pattern-Action Language for Text Processing',
    icon: 'awk',
    sections: [
      {
        title: 'Built-in Variables',
        code: `# Record & Field variables
$0          # entire current record (line)
$1, $2 ...  # field 1, 2, ...
$NF         # last field
$(NF-1)     # second-to-last field
NR          # current record number (line count)
NF          # number of fields in current record
FNR         # record number within current file

# Separator variables
FS          # Field Separator (default: whitespace)
OFS         # Output Field Separator (default: space)
RS          # Record Separator (default: newline)
ORS         # Output Record Separator (default: newline)
FILENAME    # current filename being processed

# Setting separators
awk -F','              # comma-separated
awk -F'\\t'            # tab-separated
awk -F'[,;]'           # comma OR semicolon
awk 'BEGIN{OFS=","}'   # output with commas`,
      },
      {
        title: 'Patterns & Actions',
        code: `# Pattern types
awk '/regex/ { action }' file        # regex pattern
awk '$3 == "BUY" { action }' file    # expression pattern
awk 'NR > 1 { action }' file         # skip header
awk 'NR==1, NR==10 { action }' file  # range (lines 1-10)
awk 'BEGIN { action }' file          # before file
awk 'END { action }' file            # after file

# Multiple patterns and actions
awk -F',' '
  BEGIN { print "=== Trade Report ===" }
  NR == 1 { next }            # skip header
  $3 == "BUY"  { buy++ }
  $3 == "SELL" { sell++ }
  $6 == "REJECTED" { print "REJECTED:", $2, $4 }
  END {
    print "Buy orders: " buy
    print "Sell orders: " sell
  }
' trades.csv`,
      },
      {
        title: 'Real-World awk Patterns',
        code: `# Sum quantity by symbol
awk -F',' 'NR>1 { vol[$2] += $4 }
           END { for (s in vol) print vol[s], s }' trades.csv \\
  | sort -rn | head -10

# Calculate average price per symbol
awk -F',' 'NR>1 && $6=="FILLED" {
    sum[$2] += $4 * $5    # qty * price = notional
    cnt[$2] += $4         # total qty
}
END {
    for (s in sum)
        printf "%-8s avg price: %8.2f\\n", s, sum[s]/cnt[s]
}' trades.csv

# Reformat CSV: swap columns, add derived field
awk -F',' 'BEGIN { OFS="," }
NR>1 { notional = $4 * $5
       print $1, $2, $3, $4, $5, $6, notional }' trades.csv

# Print mismatched records (column count check)
awk -F',' 'NF != 6 { print NR": wrong columns ("NF"): "$0 }' trades.csv`,
      },
    ],
  },
  {
    id: 'sed',
    title: 'sed',
    subtitle: 'Stream Editor for Filtering & Transforming Text',
    icon: 'sed',
    sections: [
      {
        title: 'Substitution & Flags',
        code: `# Substitution syntax: s/pattern/replacement/flags
sed 's/ERROR/CRITICAL/' file            # first match per line
sed 's/ERROR/CRITICAL/g' file           # all matches (global)
sed 's/ERROR/CRITICAL/2' file           # 2nd match only
sed 's/ERROR/CRITICAL/gi' file          # all, case-insensitive
sed 's|/old/path|/new/path|g' file      # use | as delimiter (no escaping needed)
sed -i 's/ERROR/CRITICAL/g' file        # in-place (modify file)
sed -i.bak 's/ERROR/CRITICAL/g' file    # in-place with .bak backup

# Backreferences (captured groups)
sed -E 's/(AAPL|GOOGL)/[$1]/g' file     # wrap symbol in brackets
sed -E 's/([0-9]{2})\\/([0-9]{2})\\/([0-9]{4})/\\3-\\1-\\2/g' file  # date format`,
      },
      {
        title: 'Delete, Print & Address Ranges',
        code: `# Deletion
sed '/DEBUG/d' file              # delete lines matching DEBUG
sed '/^$/d' file                 # delete empty lines
sed '/^#/d' file                 # delete comment lines
sed '1d' file                    # delete first line (header)
sed '$d' file                    # delete last line
sed '5,10d' file                 # delete lines 5-10
sed '/START/,/END/d' file        # delete between markers

# Print specific lines
sed -n '1p' file                 # print first line only
sed -n '5,10p' file              # print lines 5-10
sed -n '/ERROR/p' file           # print matching lines
sed -n '/START/,/END/p' file     # print between markers

# Address ranges
sed '2,5s/old/new/' file         # substitute only in lines 2-5
sed '/SYMBOL/,/END/s/x/y/' file  # substitute between markers
sed '1~2s/^/# /' file            # every other line (step)`,
      },
      {
        title: 'Trading Ops Examples',
        code: `# Normalize date formats for database import
sed -i.bak -E 's|([0-9]{2})/([0-9]{2})/([0-9]{4})|\\3-\\1-\\2|g' trades.log

# Bulk update server config (all trading configs)
sed -i 's/trading-server-01/trading-server-02/g' /etc/trading/*.conf

# Strip ANSI color codes from log files
sed 's/\\x1B\\[[0-9;]*[mGKHF]//g' colored.log > clean.log

# Extract only error blocks (START..END pattern)
sed -n '/ERROR BEGIN/,/ERROR END/p' system.log

# Remove blank lines and comments, then process
sed -e '/^$/d' -e '/^#/d' config.ini | awk -F'=' '{print $1"="$2}'

# Add header to CSV
sed -i '1i\\date,symbol,side,quantity,price,status' trades.csv

# Preview change before applying in-place
sed -n 's/OldServer/NewServer/gp' config.ini    # -n with p shows only changed lines`,
      },
    ],
  },
];

export const quickRef = [
  {
    category: 'File Operations',
    icon: '📁',
    commands: [
      { cmd: 'ls -lah', desc: 'List all files with sizes (human-readable)' },
      { cmd: 'cp -r src/ dest/', desc: 'Copy directory recursively' },
      { cmd: 'mv old.csv new.csv', desc: 'Move or rename a file' },
      { cmd: 'rm -f file.tmp', desc: 'Force delete (no prompt)' },
      { cmd: 'mkdir -p dir/sub/', desc: 'Create nested directories' },
      { cmd: 'touch trades.csv', desc: 'Create empty file / update timestamp' },
      { cmd: 'stat file.log', desc: 'Show file metadata (size, times, perms)' },
      { cmd: 'du -sh /var/log/', desc: 'Directory size (human-readable)' },
      { cmd: 'df -h', desc: 'Disk free space on all mounts' },
      { cmd: 'ln -s /path/real link', desc: 'Create symbolic link' },
    ],
  },
  {
    category: 'Text & Log Analysis',
    icon: '📄',
    commands: [
      { cmd: 'cat trades.csv', desc: 'Display entire file' },
      { cmd: 'head -n 20 file.log', desc: 'First 20 lines' },
      { cmd: 'tail -n 20 file.log', desc: 'Last 20 lines' },
      { cmd: 'tail -f trading.log', desc: 'Follow file live (real-time)' },
      { cmd: 'wc -l trades.csv', desc: 'Count lines (number of records)' },
      { cmd: 'sort -k2 trades.csv', desc: 'Sort by field 2' },
      { cmd: 'sort -u file.txt', desc: 'Sort and remove duplicates' },
      { cmd: 'uniq -c', desc: 'Count consecutive identical lines' },
      { cmd: 'cut -d\',\' -f2,4', desc: 'Extract CSV fields 2 and 4' },
      { cmd: 'tr \',\' \'\\n\'', desc: 'Replace commas with newlines' },
      { cmd: 'column -t -s\',\'', desc: 'Format CSV as aligned table' },
      { cmd: 'diff file1 file2', desc: 'Show differences between files' },
    ],
  },
  {
    category: 'Variables & Environment',
    icon: '${x}',
    commands: [
      { cmd: 'echo "${VAR}"', desc: 'Print variable value (quoted)' },
      { cmd: 'export VAR=value', desc: 'Set env var for child processes' },
      { cmd: 'env', desc: 'List all environment variables' },
      { cmd: 'printenv PATH', desc: 'Print a specific env variable' },
      { cmd: 'unset VAR', desc: 'Remove a variable' },
      { cmd: 'readonly MAX=1000', desc: 'Declare constant (read-only)' },
      { cmd: 'declare -A map', desc: 'Declare associative array (map)' },
      { cmd: 'source config.sh', desc: 'Load variables from file into shell' },
    ],
  },
  {
    category: 'Process Management',
    icon: '⚙️',
    commands: [
      { cmd: 'ps aux | grep name', desc: 'Find a running process by name' },
      { cmd: 'pgrep -f "engine.py"', desc: 'Get PID by process name/pattern' },
      { cmd: 'kill PID', desc: 'Graceful terminate (SIGTERM)' },
      { cmd: 'kill -9 PID', desc: 'Force kill (SIGKILL — last resort)' },
      { cmd: 'pkill -f "engine"', desc: 'Kill by name/pattern' },
      { cmd: 'jobs', desc: 'List background jobs in current shell' },
      { cmd: 'nohup cmd &', desc: 'Run process that survives logout' },
      { cmd: 'top', desc: 'Interactive process monitor' },
      { cmd: 'watch -n 5 "ps aux"', desc: 'Repeat command every 5 seconds' },
    ],
  },
  {
    category: 'grep Patterns',
    icon: '/re/',
    commands: [
      { cmd: 'grep -i "error"', desc: 'Case-insensitive search' },
      { cmd: 'grep -v "debug"', desc: 'Exclude matching lines (invert)' },
      { cmd: 'grep -c "FILLED"', desc: 'Count matching lines' },
      { cmd: 'grep -n "REJECT"', desc: 'Show line numbers' },
      { cmd: 'grep -r "pattern" dir/', desc: 'Recursive search in directory' },
      { cmd: 'grep -E "A|B|C"', desc: 'Match A or B or C (extended regex)' },
      { cmd: 'grep -A2 -B2 "ERROR"', desc: '2 lines context around matches' },
      { cmd: 'grep -o "[0-9]+"', desc: 'Print only matched portion' },
    ],
  },
  {
    category: 'Networking & SSH',
    icon: '🌐',
    commands: [
      { cmd: 'ping -c 4 hostname', desc: 'Test connectivity (4 packets)' },
      { cmd: 'curl -s https://api/health', desc: 'HTTP request (silent)' },
      { cmd: 'curl -o file.csv "url"', desc: 'Download file from URL' },
      { cmd: 'ssh user@host', desc: 'Connect to remote server' },
      { cmd: 'scp file user@host:~/path', desc: 'Secure copy to remote' },
      { cmd: 'netstat -an | grep LISTEN', desc: 'Show listening ports' },
      { cmd: 'ss -tlnp', desc: 'Socket stats (faster than netstat)' },
    ],
  },
  {
    category: 'Archives & Compression',
    icon: '🗜️',
    commands: [
      { cmd: 'tar -czf arch.tar.gz dir/', desc: 'Create compressed archive' },
      { cmd: 'tar -xzf arch.tar.gz', desc: 'Extract compressed archive' },
      { cmd: 'tar -tzf arch.tar.gz', desc: 'List archive contents' },
      { cmd: 'gzip file.log', desc: 'Compress file (creates .gz)' },
      { cmd: 'gunzip file.log.gz', desc: 'Decompress .gz file' },
      { cmd: 'zcat file.log.gz', desc: 'Read compressed file without extracting' },
      { cmd: 'zgrep "ERROR" file.gz', desc: 'grep inside compressed file' },
    ],
  },
  {
    category: 'Permissions',
    icon: '🔒',
    commands: [
      { cmd: 'chmod 755 script.sh', desc: 'rwxr-xr-x (owner exec, others read)' },
      { cmd: 'chmod +x script.sh', desc: 'Add execute permission' },
      { cmd: 'chmod -R 750 dir/', desc: 'Recursive permission change' },
      { cmd: 'chown user:group file', desc: 'Change file owner and group' },
      { cmd: 'ls -l file', desc: 'View file permissions' },
      { cmd: 'umask 022', desc: 'Default permission mask for new files' },
    ],
  },
];

export const proTips = [
  {
    tip: 'Always quote variables',
    detail: '"${VAR}" prevents word splitting — crucial when values contain spaces.',
    example: 'rm "${FILE}"  # safe\nrm $FILE     # breaks if FILE has spaces',
  },
  {
    tip: 'Use set -euo pipefail',
    detail: 'Add to top of every production script. Exits on error (-e), undefined var (-u), pipe failure (-o pipefail).',
    example: '#!/bin/bash\nset -euo pipefail',
  },
  {
    tip: 'Prefer [[ ]] over [ ]',
    detail: '[[ ]] is bash-specific but safer: no word splitting, supports regex with =~, no need to quote variables inside.',
    example: '[[ "$STATUS" == "FILLED" ]]  # safe\n[[ "$FILE" =~ \\.csv$ ]]     # regex match',
  },
  {
    tip: 'Use $(command) not backticks',
    detail: '$() is nestable, readable, and the modern standard. Backticks `` are legacy.',
    example: 'TODAY=$(date +%Y-%m-%d)\nFILES=$(find . -name "$(get_pattern)")',
  },
  {
    tip: 'Debug with bash -x',
    detail: 'Prints each command before execution. Invaluable for tracing script failures.',
    example: 'bash -x ./my_script.sh 2>&1 | head -50',
  },
  {
    tip: 'grep returns exit code 1 with no matches',
    detail: 'In scripts with set -e, grep with no matches will EXIT your script. Use || true to prevent this.',
    example: 'ERRORS=$(grep "ERROR" file.log | wc -l || true)',
  },
  {
    tip: 'Use mktemp for temp files',
    detail: 'Creates a unique temp file safely — avoids race conditions and naming conflicts.',
    example: 'TMPFILE=$(mktemp)\ntrap "rm -f ${TMPFILE}" EXIT  # auto-cleanup',
  },
  {
    tip: 'trap for cleanup',
    detail: 'trap runs a command when the script exits or receives a signal. Use for cleanup.',
    example: 'trap "rm -f /tmp/locks/*.lock; echo Done" EXIT INT TERM',
  },
];

export const shortcuts = [
  { keys: 'Ctrl + A', desc: 'Jump to beginning of line' },
  { keys: 'Ctrl + E', desc: 'Jump to end of line' },
  { keys: 'Ctrl + R', desc: 'Reverse search through history' },
  { keys: 'Ctrl + C', desc: 'Cancel current command' },
  { keys: 'Ctrl + Z', desc: 'Suspend process to background' },
  { keys: 'Ctrl + D', desc: 'Exit shell (EOF signal)' },
  { keys: 'Ctrl + L', desc: 'Clear screen (like clear)' },
  { keys: 'Ctrl + W', desc: 'Delete word before cursor' },
  { keys: 'Ctrl + U', desc: 'Delete entire line' },
  { keys: 'Ctrl + Y', desc: 'Paste last deleted text' },
  { keys: 'Ctrl + K', desc: 'Delete from cursor to end of line' },
  { keys: 'Alt + .', desc: 'Insert last argument of previous command' },
  { keys: '!!', desc: 'Repeat last command' },
  { keys: '!$', desc: 'Last argument of previous command' },
  { keys: '!str', desc: 'Repeat last command starting with "str"' },
  { keys: '^old^new', desc: 'Quick substitution in last command' },
  { keys: 'cd -', desc: 'Switch to previous directory' },
  { keys: 'Tab', desc: 'Autocomplete command or filename' },
];

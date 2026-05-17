import React from 'react';

export default function Header({
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <header className="sticky top-0 z-50 h-14 flex items-center px-4 gap-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
        title="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono text-[#ff6900] font-bold text-lg leading-none">$_</span>
        <div className="hidden sm:block">
          <span className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
            Bash Interview Prep
          </span>
          <span className="block text-xs text-slate-400 dark:text-slate-500 leading-tight">
            Trading Ops · Open Book
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions, commands, concepts..."
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
          <kbd className="font-sans">Ctrl</kbd>+<kbd className="font-sans">R</kbd>
          <span className="ml-1">history</span>
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

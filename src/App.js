import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightPanel from './components/RightPanel';
import QuestionCard from './components/QuestionCard';
import FundamentalsSection from './components/FundamentalsSection';
import TextProcessingSection from './components/TextProcessingSection';
import CommandPlayground from './components/CommandPlayground';
import CommonMistakesSection from './components/CommonMistakesSection';
import { questions, fundamentals, textProcessing } from './data/content';

const STORAGE_KEYS = {
  theme: 'bash-prep-theme',
  reviewed: 'bash-prep-reviewed',
};

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key)) || []);
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) || 'dark'
  );
  const [activeSection, setActiveSection] = useState('questions');
  const [activeFundamental, setActiveFundamental] = useState(null);
  const [activeTextProc, setActiveTextProc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewed, setReviewed] = useState(() => loadSet(STORAGE_KEYS.reviewed));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleReviewed = useCallback((id) => {
    setReviewed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(STORAGE_KEYS.reviewed, next);
      return next;
    });
  }, []);


  const navigateTo = useCallback((section, subId) => {
    setActiveSection(section);
    setSearchQuery('');
    if (section === 'fundamentals' && subId) setActiveFundamental(subId);
    if (section === 'textprocessing' && subId) setActiveTextProc(subId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const q = searchQuery.toLowerCase();
    return questions.filter(
      item =>
        item.question.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const reviewedCount = reviewed.size;
  const totalQuestions = questions.length;

  const mainBg = 'bg-slate-100 dark:bg-slate-900';
  const panelBg = 'bg-white dark:bg-slate-800';

  return (
    <div className={`min-h-screen ${mainBg} text-slate-900 dark:text-slate-100 font-sans`}>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSection={activeSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`
            flex-shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-700
            ${panelBg} transition-all duration-200
            ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'}
          `}
        >
          <LeftSidebar
            activeSection={activeSection}
            activeFundamental={activeFundamental}
            activeTextProc={activeTextProc}
            navigateTo={navigateTo}
            reviewedCount={reviewedCount}
            totalQuestions={totalQuestions}
            fundamentals={fundamentals}
            textProcessing={textProcessing}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {activeSection === 'questions' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Interview Questions
                    <span className="ml-3 text-sm font-normal text-slate-500 dark:text-slate-400">
                      Level 1–2 · Trading Operations
                    </span>
                  </h2>
                  {searchQuery && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {filteredQuestions.length} result{filteredQuestions.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                  )}
                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff6900] to-[#fcb900] rounded-full transition-all duration-500"
                        style={{ width: `${(reviewedCount / totalQuestions) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {reviewedCount}/{totalQuestions} reviewed
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-lg">No results for "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-3 text-sm text-[#ff6900] hover:underline"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    filteredQuestions.map((q, idx) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={idx}
                        isReviewed={reviewed.has(q.id)}
                        onToggleReviewed={() => toggleReviewed(q.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {activeSection === 'fundamentals' && (
              <FundamentalsSection
                fundamentals={fundamentals}
                activeFundamental={activeFundamental}
                setActiveFundamental={setActiveFundamental}
              />
            )}

            {activeSection === 'textprocessing' && (
              <TextProcessingSection
                textProcessing={textProcessing}
                activeTextProc={activeTextProc}
                setActiveTextProc={setActiveTextProc}
              />
            )}

            {activeSection === 'playground' && (
              <CommandPlayground />
            )}

            {activeSection === 'mistakes' && (
              <CommonMistakesSection />
            )}

          </div>
        </main>

        {/* Right Panel */}
        <aside className="flex-shrink-0 w-72 overflow-y-auto border-l border-slate-200 dark:border-slate-700 hidden xl:block">
          <RightPanel theme={theme} />
        </aside>
      </div>
    </div>
  );
}

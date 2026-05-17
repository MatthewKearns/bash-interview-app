import React, { useState } from 'react';

const NAV_SECTIONS = [
  {
    id: 'questions',
    label: 'Interview Questions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'fundamentals',
    label: 'Bash Fundamentals',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    children: ['variables', 'conditionals', 'loops', 'functions'],
  },
  {
    id: 'textprocessing',
    label: 'Text Processing',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: ['grep', 'awk', 'sed'],
  },
  {
    id: 'mistakes',
    label: 'Common Mistakes',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: 'playground',
    label: 'Command Playground',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const CHILD_LABELS = {
  variables: 'Variables',
  conditionals: 'Conditionals',
  loops: 'Loops',
  functions: 'Functions',
  grep: 'grep',
  awk: 'awk',
  sed: 'sed',
};

export default function LeftSidebar({
  activeSection,
  activeFundamental,
  activeTextProc,
  navigateTo,
  reviewedCount,
  totalQuestions,
  fundamentals,
  textProcessing,
}) {
  const [expanded, setExpanded] = useState({ fundamentals: true, textprocessing: true });

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const isActive = (sectionId, childId) => {
    if (childId) {
      return activeSection === sectionId &&
        (sectionId === 'fundamentals' ? activeFundamental === childId : activeTextProc === childId);
    }
    return activeSection === sectionId && !childId;
  };

  return (
    <div className="p-3 flex flex-col h-full">

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {NAV_SECTIONS.map(section => (
          <div key={section.id}>
            {/* Main section row */}
            <button
              onClick={() => {
                if (section.children) {
                  toggleExpand(section.id);
                  navigateTo(
                    section.id,
                    section.id === 'fundamentals'
                      ? (activeFundamental || fundamentals[0]?.id)
                      : (activeTextProc || textProcessing[0]?.id)
                  );
                } else {
                  navigateTo(section.id);
                }
              }}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors text-left
                ${isActive(section.id) && !section.children
                  ? 'bg-orange-50 dark:bg-[#ff6900]/10 text-orange-700 dark:text-[#ff6900]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                ${section.children && activeSection === section.id
                  ? 'text-slate-900 dark:text-white'
                  : ''}
              `}
            >
              <span className={`
                ${isActive(section.id) && !section.children ? 'text-[#ff6900]' : 'text-slate-400 dark:text-slate-500'}
                ${activeSection === section.id && section.children ? 'text-[#ff6900]' : ''}
              `}>
                {section.icon}
              </span>
              <span className="flex-1 truncate">{section.label}</span>
              {section.children && (
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${expanded[section.id] ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Children */}
            {section.children && expanded[section.id] && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                {section.children.map(childId => {
                  const active = isActive(section.id, childId);
                  return (
                    <button
                      key={childId}
                      onClick={() => navigateTo(section.id, childId)}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium
                        transition-colors text-left
                        ${active
                          ? 'bg-orange-50 dark:bg-[#ff6900]/10 text-orange-700 dark:text-[#ff6900]'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}
                      `}
                    >
                      <span className={`font-mono text-xs ${active ? 'text-[#ff6900]' : 'text-slate-400'}`}>
                        {childId === 'variables' ? '${x}' :
                         childId === 'conditionals' ? 'if' :
                         childId === 'loops' ? 'for' :
                         childId === 'functions' ? 'fn' :
                         childId === 'grep' ? '//' :
                         childId === 'awk' ? '{}' : '//'}
                      </span>
                      {CHILD_LABELS[childId]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Quick stats footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="text-lg font-bold text-[#ff6900]">{reviewedCount}</div>
            <div className="text-xs text-slate-400">Reviewed</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {totalQuestions - reviewedCount}
            </div>
            <div className="text-xs text-slate-400">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}

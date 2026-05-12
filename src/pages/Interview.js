import React, { useState } from 'react';
import QuestionBox from '../components/QuestionBox';
import ResultDisplay from '../components/ResultDisplay';

const questions = [
    {
        question: "What is the command to list files in a directory?",
        answer: "ls",
        category: "Basic"
    },
    {
        question: "How do you change directories in bash?",
        answer: "cd",
        category: "Navigation"
    },
    {
        question: "What command is used to copy files?",
        answer: "cp",
        category: "File Operations"
    },
    {
        question: "How do you move or rename files?",
        answer: "mv",
        category: "File Operations"
    },
    {
        question: "What command is used to remove files?",
        answer: "rm",
        category: "File Operations"
    },
    {
        question: "How do you display the contents of a file?",
        answer: "cat",
        category: "File Operations"
    },
    {
        question: "What command finds files by name?",
        answer: "find",
        category: "Search"
    },
    {
        question: "How do you search for text patterns in files?",
        answer: "grep",
        category: "Search"
    },
    {
        question: "What command displays the current directory path?",
        answer: "pwd",
        category: "Navigation"
    },
    {
        question: "How do you create a new directory?",
        answer: "mkdir",
        category: "File Operations"
    },
    {
        question: "What command removes an empty directory?",
        answer: "rmdir",
        category: "File Operations"
    },
    {
        question: "How do you change file permissions?",
        answer: "chmod",
        category: "Permissions"
    },
    {
        question: "What command changes file ownership?",
        answer: "chown",
        category: "Permissions"
    },
    {
        question: "How do you create a symbolic link?",
        answer: "ln",
        category: "File Operations"
    },
    {
        question: "What command displays disk usage?",
        answer: "du",
        category: "System"
    },
    {
        question: "How do you view running processes?",
        answer: "ps",
        category: "Processes"
    },
    {
        question: "What command terminates a process?",
        answer: "kill",
        category: "Processes"
    },
    {
        question: "How do you redirect output to a file?",
        answer: ">",
        category: "Redirection"
    },
    {
        question: "What operator appends output to a file?",
        answer: ">>",
        category: "Redirection"
    },
    {
        question: "How do you pipe output from one command to another?",
        answer: "|",
        category: "Pipes"
    },
    {
        question: "What command archives files (tar)?",
        answer: "tar",
        category: "Compression"
    },
    {
        question: "How do you compress files with gzip?",
        answer: "gzip",
        category: "Compression"
    },
    {
        question: "What command checks network connectivity?",
        answer: "ping",
        category: "Network"
    },
    {
        question: "How do you display environment variables?",
        answer: "env",
        category: "Environment"
    },
    {
        question: "What command shows command history?",
        answer: "history",
        category: "History"
    }
];

const Interview = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [showStats, setShowStats] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSubmit = () => {
        setIsSubmitted(true);
        setAnsweredCount(answeredCount + 1);
        
        if (userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
            setCorrectCount(correctCount + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setUserAnswer('');
            setIsSubmitted(false);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowStats(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setUserAnswer('');
        setIsSubmitted(false);
        setCorrectCount(0);
        setAnsweredCount(0);
        setShowStats(false);
    };

    return (
        <>
            {showStats ? (
                <div className="stats-container">
                    <h2>Quiz Complete! 🎉</h2>
                    <div className="final-score">
                        <p>Final Score: <strong>{correctCount} / {questions.length}</strong></p>
                        <p>Percentage: <strong>{Math.round((correctCount / questions.length) * 100)}%</strong></p>
                    </div>
                    <div className="score-feedback">
                        {correctCount === questions.length && <p>Perfect score! You're ready for the interview!</p>}
                        {correctCount >= questions.length * 0.8 && correctCount < questions.length && <p>Excellent work! You're well prepared.</p>}
                        {correctCount >= questions.length * 0.6 && correctCount < questions.length * 0.8 && <p>Good job! Review the ones you missed.</p>}
                        {correctCount < questions.length * 0.6 && <p>Keep practicing! You'll get better.</p>}
                    </div>
                    <button className="restart-button" onClick={handleRestart}>Retake Quiz</button>
                </div>
            ) : (
                <>
                    <div className="progress-container">
                        <div className="progress-info">
                            <span className="progress-text">Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span className="score-badge">✓ {correctCount} Correct</span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <QuestionBox 
                        question={currentQuestion.question} 
                        correctAnswer={currentQuestion.answer}
                        userAnswer={userAnswer} 
                        setUserAnswer={setUserAnswer} 
                        onAnswerSubmit={handleAnswerSubmit}
                        isSubmitted={isSubmitted}
                    />
                    {isSubmitted && (
                        <>
                            <ResultDisplay 
                                userAnswer={userAnswer} 
                                correctAnswer={currentQuestion.answer} 
                            />
                            <button className="next-button" onClick={handleNextQuestion}>
                                {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                            </button>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default Interview;
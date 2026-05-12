import React from 'react';

const ResultDisplay = ({ userAnswer, correctAnswer }) => {
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    return (
        <div className={`result-display ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
                <>
                    <h2>✓ Correct!</h2>
                    <p>Your answer: <strong>{userAnswer}</strong></p>
                </>
            ) : (
                <>
                    <h2>✗ Incorrect!</h2>
                    <p>Your answer: <strong>{userAnswer}</strong></p>
                    <p>Correct answer: <strong>{correctAnswer}</strong></p>
                </>
            )}
        </div>
    );
};

export default ResultDisplay;
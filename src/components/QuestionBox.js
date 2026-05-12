import React from 'react';

const QuestionBox = ({ question, correctAnswer, userAnswer, setUserAnswer, onAnswerSubmit, isSubmitted }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onAnswerSubmit();
    };

    return (
        <div className="question-box">
            <h2>{question}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Your answer"
                    disabled={isSubmitted}
                    required
                />
                <button type="submit" disabled={isSubmitted}>Submit</button>
            </form>
        </div>
    );
};

export default QuestionBox;
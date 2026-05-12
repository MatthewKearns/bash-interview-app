import React from 'react';
import ReactDOM from 'react-dom';
import Interview from './pages/Interview';
import './index.css';

const App = () => {
    return (
        <div className="container">
            <h1>Bash Interview Preparation</h1>
            <Interview />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
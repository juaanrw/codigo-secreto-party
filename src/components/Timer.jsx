import React, { useState, useEffect } from 'react';

const Timer = ({ turnTimestamp, turnDuration, isPaused }) => {
    const [timeLeft, setTimeLeft] = useState(turnDuration);
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - turnTimestamp) / 1000);
            const remaining = turnDuration - elapsed;
            setTimeLeft(remaining > 0 ? remaining : 0);
        }, 1000);
        return () => clearInterval(interval);
    }, [turnTimestamp, turnDuration, isPaused]);
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60) < 10 ? '0' : ''}${seconds % 60}`;

    return (
        <div className={`font-mono font-bold text-xl px-3 py-1 rounded flex items-center gap-2 ${timeLeft < 10 && !isPaused ? 'bg-red-600 animate-pulse' : 'bg-black/50'}`}>
            {isPaused ? <span className="text-yellow-400">⏸️ ESPERA</span> : `⏱ ${formatTime(timeLeft)}`}
        </div>
    );
};

export default Timer;

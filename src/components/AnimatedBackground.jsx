import React, { useState, useEffect } from 'react';

const BgSquare = () => {
    const colors = ["bg-amber-200", "bg-amber-200", "bg-amber-200", "bg-red-600", "bg-blue-600", "bg-gray-900"];
    const [color, setColor] = useState(colors[Math.floor(Math.random() * colors.length)]);
    useEffect(() => {
        const interval = setInterval(() => { setColor(colors[Math.floor(Math.random() * colors.length)]); }, 2000 + Math.random() * 4000);
        return () => clearInterval(interval);
    }, []);
    return <div className={`w-full h-full rounded-md transition-colors duration-[2000ms] ease-in-out ${color}`} />;
};

const AnimatedBackground = () => {
    const squares = Array.from({ length: 60 });
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="grid grid-cols-6 md:grid-cols-10 gap-2 h-full w-full p-2 opacity-40">
                {squares.map((_, i) => <BgSquare key={i} />)}
            </div>
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[2px]"></div>
        </div>
    );
};

export default AnimatedBackground;

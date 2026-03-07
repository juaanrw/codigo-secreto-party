import React from 'react';

const Card = ({ data, viewMode, onClick, isSelected, isProposed }) => {
    const colors = {
        red: "bg-red-600 text-white border-red-800",
        blue: "bg-blue-600 text-white border-blue-800",
        neutral: "bg-amber-100 text-gray-800 border-amber-300",
        bomb: "bg-gray-900 text-white border-gray-700",
        unknown: "bg-slate-300 text-gray-800 border-slate-400"
    };

    let displayType = 'neutral';
    let isRevealed = data.revealed;

    if (viewMode === 'table') displayType = isRevealed ? data.type : 'neutral';
    else if (viewMode === 'captain_god') displayType = data.type;
    else if (viewMode === 'captain_red') displayType = (isRevealed || data.type === 'red') ? data.type : 'unknown';
    else if (viewMode === 'captain_blue') displayType = (isRevealed || data.type === 'blue') ? data.type : 'unknown';

    let baseClass = `w-full h-full min-h-0 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm md:text-xl lg:text-2xl select-none transition-all shadow-md p-0.5 sm:p-1 md:p-2 text-center break-words leading-tight sm:leading-none border-b-4 active:border-b-0 active:translate-y-1 relative`;

    const selectionClass = isSelected ? "ring-4 ring-yellow-400 scale-105 z-20" : "";
    const revealedClass = isRevealed ? "opacity-90 ring-4 ring-black/30 border-b-0 translate-y-1 saturate-150" : "cursor-pointer hover:scale-105";
    const proposalClass = (isProposed && !isRevealed) ? "ring-4 ring-white ring-dashed animate-pulse z-10" : "";
    const colorClass = colors[displayType] || colors['neutral'];

    return (
        <div onClick={onClick} className={`${baseClass} ${colorClass} ${revealedClass} ${selectionClass} ${proposalClass}`}>
            {data.word}
            {isRevealed && <span className="absolute bottom-1 right-1 text-[10px] bg-white text-black px-1 rounded shadow">VISTO</span>}
            {(isProposed && !isRevealed) && <span className="absolute -top-3 -right-2 text-2xl drop-shadow-lg filter animate-bounce">👆</span>}
        </div>
    );
};

export default Card;

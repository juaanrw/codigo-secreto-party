import React from 'react';

const InfoBtn = ({ title, desc, setActiveInfo }) => (
    <button
        onClick={(e) => { e.stopPropagation(); setActiveInfo({ title, desc }); }}
        className="w-6 h-6 rounded-full bg-slate-600 text-xs font-bold flex items-center justify-center hover:bg-slate-200 hover:text-black transition"
    >
        ?
    </button>
);

export default InfoBtn;

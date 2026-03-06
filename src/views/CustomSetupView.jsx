import React from 'react';

const CustomSetupView = ({ customWordsInput, setCustomWordsInput, initializeGame, setView }) => {
    const handleWordChange = (i, v) => {
        const n = [...customWordsInput];
        n[i] = v;
        setCustomWordsInput(n);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 text-white">
            <h2 className="text-2xl font-black text-amber-500 mb-2 uppercase">Escribe 25 Palabras</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full max-w-4xl mb-20">
                {customWordsInput.map((w, i) => (
                    <input key={i} type="text" placeholder={`Palabra ${i + 1}`} value={w} onChange={(e) => handleWordChange(i, e.target.value)} className="bg-slate-800 border border-slate-600 rounded p-2 text-center text-sm" maxLength={12} />
                ))}
            </div>
            <div className="fixed bottom-0 w-full bg-slate-900 p-4 border-t border-slate-800 flex gap-4 justify-center">
                <button onClick={() => setView('home')} className="px-6 py-3 rounded-lg bg-slate-700 font-bold">CANCELAR</button>
                <button onClick={() => initializeGame(customWordsInput)} disabled={!customWordsInput.every(w => w.trim().length > 0)} className="px-8 py-3 rounded-lg font-black text-black bg-slate-200 disabled:bg-gray-600">¡CREAR!</button>
            </div>
        </div>
    );
};

export default CustomSetupView;

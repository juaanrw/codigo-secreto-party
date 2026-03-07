import React from 'react';

const RoleSelectionView = ({ roomCode, handleRoleSelection, exitToHome }) => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 relative">
        <button onClick={exitToHome} className="absolute top-4 left-4 z-50 bg-slate-700 p-2 rounded-lg text-xl hover:bg-slate-600 transition shadow-lg border border-slate-500 text-white">🏠 Volver</button>
        <h2 className="text-2xl font-bold mb-8">SALA <span className="text-amber-500">{roomCode}</span></h2>
        <div className="grid gap-6 w-full max-w-md">
            <button onClick={() => handleRoleSelection('table')} className="bg-slate-700 p-6 rounded-2xl border-2 border-slate-500 flex flex-col items-center hover:bg-slate-600 transition hover:scale-105"><span className="text-4xl">📺</span><span className="font-bold">MODO MESA</span></button>
            <button onClick={() => handleRoleSelection('captain')} className="bg-amber-600 p-6 rounded-2xl border-2 border-amber-400 flex flex-col items-center hover:bg-amber-500 transition hover:scale-105"><span className="text-4xl">🕵️‍♂️</span><span className="font-bold">MODO CAPITÁN</span></button>
        </div>
    </div>
);

export default RoleSelectionView;

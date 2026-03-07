import React from 'react';

export const InfoModal = ({ title, text, onClose }) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 animate-fadeIn" onClick={onClose}>
        <div className="bg-slate-800 p-6 rounded-xl max-w-sm text-center border border-slate-600 shadow-2xl">
            <h3 className="text-amber-400 font-bold text-xl mb-3">{title}</h3>
            <p className="text-gray-300 mb-6">{text}</p>
            <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg">Cerrar</button>
        </div>
    </div>
);

export const RulesModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-slate-800 text-white p-6 rounded-xl max-w-md w-full shadow-2xl border border-slate-600 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-black text-amber-400 mb-6 text-center border-b border-slate-600 pb-4">📜 REGLAS DEL JUEGO</h2>

            <div className="space-y-5 text-sm text-gray-300 leading-relaxed">

                <div>
                    <h3 className="text-white font-bold text-lg mb-1">1. Preparación y Equipos</h3>
                    <p>Dividid el grupo en dos: <strong className="text-red-400">Equipo Rojo</strong> y <strong className="text-blue-400">Equipo Azul</strong>. Elegid un Capitán por equipo. El juego elegirá al azar quién empieza.</p>
                    <div className="mt-2 bg-slate-700/50 p-2 rounded border-l-4 border-amber-500">
                        <p className="text-xs text-gray-300">💡 <strong>¿Por qué un equipo tiene una palabra más?</strong><br />El equipo que empieza tiene ventaja de iniciativa, por lo que para equilibrarlo debe adivinar <strong>9 palabras</strong>, mientras que el segundo equipo solo <strong>8</strong>.</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-1">2. Significado de las Cartas</h3>
                    <ul className="space-y-2 mt-2">
                        <li className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded shadow"></div> <span><strong>Agente Rojo:</strong> Punto para el equipo Rojo.</span></li>
                        <li className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded shadow"></div> <span><strong>Agente Azul:</strong> Punto para el equipo Azul.</span></li>
                        <li className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-200 rounded shadow"></div> <span><strong>Civil Inocente:</strong> Gente normal. Si lo tocas, tu turno <strong>termina inmediatamente</strong>.</span></li>
                        <li className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-900 border border-white rounded shadow"></div> <span className="text-red-400 font-bold">¡EL ASESINO! Si lo tocas, PIERDES LA PARTIDA al instante.</span></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-1">3. Dinámica del Turno</h3>
                    <p>El Capitán da una pista: <strong>PALABRA + NÚMERO</strong> (Ej: <em>"Volar, 2"</em>). O hace un <strong>DIBUJO</strong> si ese modo está activo.</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><strong>Si aciertas:</strong> Puedes seguir adivinando.</li>
                        <li><strong>Si fallas (Civil o Equipo contrario):</strong> Tu turno termina. <br /><span className="text-xs text-gray-400">(Nota: Si revelas una carta del rival, ¡le regalas el punto!)</span></li>
                        <li><strong>¿Cuántas puedo tocar?</strong> Puedes intentar adivinar el número que dijo el capitán <strong>más una extra</strong> (por si te quedó una pendiente de turnos anteriores). Puedes plantarte cuando quieras.</li>
                    </ul>
                </div>

                <div className="bg-red-900/30 p-4 rounded-lg border border-red-800/50">
                    <h3 className="text-red-400 font-bold text-lg mb-1">⚠️ CÓDIGO DE HONOR</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Nada de gestos o caras al ver lo que tocan los agentes.</li>
                        <li>No se puede decir parte de la palabra de la mesa.</li>
                        <li>No se pueden dar pistas sobre la letra inicial o posición.</li>
                    </ul>
                </div>
            </div>

            <button onClick={onClose} className="w-full mt-6 bg-slate-200 hover:bg-amber-600 text-black font-bold py-4 rounded-lg transition shadow-lg">
                ¡ENTENDIDO!
            </button>
        </div>
    </div>
);

export const DrawingGalleryModal = ({ drawings, onClose, roomCode }) => {
    if (!drawings || drawings.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-slate-800 p-6 rounded-xl w-full max-w-4xl flex flex-col gap-4 shadow-2xl relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-red-500 font-bold text-2xl px-2">✕</button>
                <div className="flex justify-between items-center sm:px-4 mt-2">
                    <h3 className="text-white font-black text-2xl sm:text-3xl uppercase">🖼️ Galería de Dibujos</h3>
                </div>

                <div className="overflow-y-auto w-full p-2 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                        {drawings.map((imgSrc, index) => (
                            <div key={index} className="bg-white p-2 rounded-lg flex flex-col items-center gap-2 shadow-lg relative group">
                                <span className="absolute -top-3 -left-3 bg-amber-500 text-black font-black w-8 h-8 flex items-center justify-center rounded-full shadow border-2 border-white">{index + 1}</span>
                                <div className="border-2 border-black w-full h-48 bg-white flex items-center justify-center overflow-hidden rounded">
                                    <img src={imgSrc} alt={`Dibujo ${index + 1}`} className="w-full h-full object-contain" />
                                </div>
                                <button onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = imgSrc;
                                    a.download = `dibujo-cs-${roomCode}-${index + 1}.png`;
                                    a.click();
                                }} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded w-full text-sm transition flex justify-center items-center gap-2">
                                    💾 Descargar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

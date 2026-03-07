import React, { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import { RulesModal, InfoModal } from '../components/Modals';
import InfoBtn from '../components/InfoBtn';

const HomeView = ({
    config, setConfig,
    showRules, setShowRules,
    activeInfo, setActiveInfo,
    createRoom, joinRoom,
    isIOS, deferredPrompt, handleInstallClick
}) => {
    const [codeInput, setCodeInput] = useState('');

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
            <AnimatedBackground />
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
            {activeInfo && <InfoModal title={activeInfo.title} text={activeInfo.desc} onClose={() => setActiveInfo(null)} />}

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                <h1 className="text-5xl font-black mb-6 tracking-wider text-center drop-shadow-lg">
                    <span className="text-red-500">CÓDIGO</span> <span className="text-blue-500">SECRETO</span>
                </h1>
                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl w-full shadow-2xl border border-slate-700 space-y-6">
                    <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl">
                        <p className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-2 border-b border-slate-700 pb-2">Configuración de Partida</p>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.isParty} onChange={(e) => setConfig({ ...config, isParty: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>🎨 Modo Dibujo</span></label>
                            <InfoBtn title="Modo Dibujo (Pictionary)" desc="El capitán NO puede hablar. Todas las pistas se darán dibujando en la pizarra interactiva." setActiveInfo={setActiveInfo} />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.useTimer} onChange={(e) => setConfig({ ...config, useTimer: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>⏱️ Temporizador</span></label>
                            <InfoBtn title="Temporizador" desc="Activa una cuenta atrás de 2 minutos por turno para agilizar la partida." setActiveInfo={setActiveInfo} />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.hardMode} onChange={(e) => setConfig({ ...config, hardMode: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>💀 Modo Difícil</span></label>
                            <InfoBtn title="Modo Difícil" desc="Privacidad total: Los capitanes comparten un dispositivo y la pantalla se oculta al cambiar de turno." setActiveInfo={setActiveInfo} />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.customWordsMode} onChange={(e) => setConfig({ ...config, customWordsMode: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>✍️ Palabras Propias</span></label>
                            <InfoBtn title="Palabras Personalizadas" desc="Permite escribir manualmente las 25 palabras antes de empezar la partida." setActiveInfo={setActiveInfo} />
                        </div>
                    </div>
                    <button onClick={createRoom} className="w-full bg-slate-200 hover:bg-amber-400 text-black font-black py-4 rounded-xl text-lg shadow-lg active:scale-95">CREAR PARTIDA</button>
                    <div className="flex gap-2 border-t border-slate-700 pt-4">
                        <input type="text" placeholder="CÓDIGO" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} maxLength={4} className="w-full p-3 rounded-lg text-black bg-slate-200 uppercase font-bold text-center text-lg" />
                        <button onClick={() => joinRoom(codeInput)} className="bg-blue-600 hover:bg-blue-500 font-bold px-6 rounded-lg text-white">ENTRAR</button>
                    </div>
                    <button onClick={() => setShowRules(true)} className="w-full text-slate-400 text-sm hover:text-white transition underline">Leer Reglas</button>

                    {(deferredPrompt || isIOS) && (
                        <div className="pt-4 border-t border-slate-700 w-full animate-fadeIn">
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black py-4 rounded-xl text-lg shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span className="text-2xl">📱</span> ¡DESCARGA EL JUEGO!
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">Instala la app en tu dispositivo para un acceso rápido</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeView;

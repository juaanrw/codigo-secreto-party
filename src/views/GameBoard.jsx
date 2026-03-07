import React from 'react';
import Card from '../components/Card';
import Timer from '../components/Timer';
import DrawingBoard from '../components/DrawingBoard';
import { RulesModal, DrawingGalleryModal } from '../components/Modals';

const GameBoard = ({
    gameData, roomCode, isCaptain, privacyShieldActive,
    areWordsVisible, selectedCardIndex,
    showRules, setShowRules, showDrawing, setShowDrawing,
    goHome, copyLink, linkCopied, activateHardModeTurn,
    confirmReveal, passTurn, newGame, goHomeFinal,
    handleCardClick
}) => {
    const [showGallery, setShowGallery] = React.useState(false);

    const redLeft = gameData.board.filter(c => c.type === 'red' && !c.revealed).length;
    const blueLeft = gameData.board.filter(c => c.type === 'blue' && !c.revealed).length;
    const isRedTurn = gameData.turn === 'red';
    const bgColor = isRedTurn ? 'bg-red-900' : 'bg-blue-900';

    let cardViewMode = 'table';
    if (isCaptain) {
        if (gameData.config.hardMode) {
            if (!areWordsVisible) cardViewMode = 'table';
            else cardViewMode = isRedTurn ? 'captain_red' : 'captain_blue';
        } else cardViewMode = 'captain_god';
    }

    const isDrawingChallenge = gameData.challenge?.includes("Dibujo");

    return (
        <div className={`h-[100dvh] w-full overflow-hidden ${bgColor} transition-colors duration-700 flex flex-col pb-20 md:pb-24`}>
            {showRules && <RulesModal onClose={() => setShowRules(false)} />}
            {showGallery && gameData.drawings && <DrawingGalleryModal drawings={gameData.drawings} onClose={() => setShowGallery(false)} roomCode={roomCode} />}
            <DrawingBoard isOpen={showDrawing} onClose={() => setShowDrawing(false)} isCaptain={isCaptain && !privacyShieldActive} roomCode={roomCode} existingImage={gameData.drawing} />

            <div className="bg-slate-900/90 backdrop-blur text-white p-2 shadow-lg flex justify-between items-center sticky top-0 z-30">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-1">
                        <button onClick={goHome} className="bg-slate-700 p-1.5 rounded w-8 h-8">🏠</button>
                        <button onClick={() => setShowRules(true)} className="bg-slate-700 p-1.5 rounded w-8 h-8 font-bold">?</button>
                    </div>
                    <div className="flex flex-col cursor-pointer" onClick={copyLink}>
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest flex items-center gap-1">SALA {linkCopied && <span className="text-green-400"> (COPIADO)</span>}</span>
                        <div className="flex items-center gap-2"><span className="text-xl font-black text-amber-500 tracking-widest leading-none">{roomCode}</span><span className="text-gray-500 text-xs">🔗</span></div>
                    </div>
                </div>
                {(isDrawingChallenge || gameData.drawing) && <button onClick={() => setShowDrawing(true)} className="bg-white text-black p-2 rounded-full shadow-lg animate-bounce-slow font-bold text-xl" title="Abrir Pizarra">🎨</button>}
                <div className="flex items-center gap-3 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    <div className={`text-2xl font-black ${isRedTurn ? 'scale-110' : 'opacity-60'} text-red-500`}>{redLeft}</div>
                    <div className="h-5 w-px bg-gray-500"></div>
                    <div className={`text-2xl font-black ${!isRedTurn ? 'scale-110' : 'opacity-60'} text-blue-500`}>{blueLeft}</div>
                </div>
                <div>
                    {gameData.config.useTimer ? (
                        <Timer turnTimestamp={gameData.turnTimestamp} turnDuration={120} isPaused={gameData.paused} />
                    ) : (
                        <span className={`font-bold px-2 py-1 rounded text-sm ${isRedTurn ? 'bg-red-600' : 'bg-blue-600'}`}>
                            {isRedTurn ? ' TURNO DEL ROJO' : 'TURNO DEL AZUL'}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 p-2 md:p-6 w-full max-w-5xl mx-auto relative flex flex-col min-h-0">
                {privacyShieldActive && !gameData.winner && (
                    <div className="absolute inset-0 z-40 bg-slate-800 flex flex-col items-center justify-center p-6 text-center rounded-lg m-2 border-4 border-slate-600">
                        <h2 className="text-3xl font-black text-white mb-2">ALTO AHÍ</h2><p className="text-gray-400 mb-8">Pasa el dispositivo al Capitán:</p><div className={`text-4xl font-black mb-10 ${isRedTurn ? 'text-red-500' : 'text-blue-500'} uppercase animate-pulse`}>{isRedTurn ? 'ROJO 🔴' : 'AZUL 🔵'}</div>
                        <button onClick={activateHardModeTurn} className="bg-white text-black font-bold py-4 px-8 rounded-full shadow-xl hover:scale-105 transition">SOY EL CAPITÁN</button>
                    </div>
                )}
                {gameData.config.isParty && (
                    <div className="bg-slate-200 text-black p-3 text-center font-bold rounded-lg shadow-lg mb-4 mx-auto max-w-md flex flex-col"><span className="text-sm uppercase opacity-70">RETO:</span><span className="text-lg">{gameData.challenge}</span>{isDrawingChallenge && <span className="text-xs mt-1 bg-black/10 rounded px-2">Pulsa 🎨 arriba para dibujar</span>}</div>
                )}
                <div className="grid grid-cols-5 grid-rows-5 gap-1 sm:gap-2 md:gap-4 flex-1 min-h-0">
                    {gameData.board.map((card, i) => (
                        <Card key={i} data={card} viewMode={cardViewMode} isSelected={selectedCardIndex === i} isProposed={gameData.proposedCard === i} onClick={() => !privacyShieldActive ? handleCardClick(i) : null} />
                    ))}
                </div>
            </div>

            {isCaptain && (
                <div className="fixed bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col gap-2 z-40">
                    {gameData.proposedCard !== null && gameData.proposedCard !== -1 && gameData.board[gameData.proposedCard] && !gameData.winner && (
                        <button onClick={confirmReveal} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl shadow-lg active:scale-95 text-lg animate-bounce-short">
                            👆 REVELAR "{gameData.board[gameData.proposedCard].word}"
                        </button>
                    )}
                    <div className="flex gap-3">
                        <button onClick={passTurn} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl border border-slate-500 shadow-lg">PASAR TURNO</button>
                        {gameData.winner && <button onClick={newGame} className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl animate-pulse shadow-lg">NUEVA PARTIDA</button>}
                    </div>
                </div>
            )}

            {gameData.winner && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] animate-slideUp">
                    <div className="bg-slate-900/95 border-t-4 border-amber-500 rounded-t-3xl p-6 shadow-2xl flex flex-col items-center justify-center gap-6 max-w-5xl mx-auto">
                        <div className="text-center w-full flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">PARTIDA FINALIZADA</p>
                                <h2 className={`text-4xl md:text-5xl font-black ${gameData.winner === 'red' ? 'text-red-500' : 'text-blue-500'}`}>¡GANA EL {gameData.winner === 'red' ? 'ROJO' : 'AZUL'}!</h2>
                            </div>
                            {gameData.drawings && gameData.drawings.length > 0 && (
                                <button onClick={() => setShowGallery(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black py-3 px-6 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2 border border-amber-400">
                                    🖼️ Ver Galería de Dibujos ({gameData.drawings.length})
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <button onClick={goHomeFinal} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition">🏠 SALIR</button>
                            <button onClick={newGame} className="flex-1 bg-white hover:scale-105 text-black font-black py-3 px-8 rounded-xl shadow-lg transition animate-pulse">JUGAR OTRA VEZ ↻</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoard;

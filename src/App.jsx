import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { ref, set, onValue, update } from "firebase/database";
import { generateBoard, cleanupOldRooms, playSound } from './utils';

import HomeView from './views/HomeView';
import CustomSetupView from './views/CustomSetupView';
import RoleSelectionView from './views/RoleSelectionView';
import GameBoard from './views/GameBoard';

export default function App() {
  const [view, setView] = useState('home');
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState(null);

  const [showRules, setShowRules] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);
  const [showDrawing, setShowDrawing] = useState(false);

  const [config, setConfig] = useState({ isParty: false, useTimer: false, hardMode: false, customWordsMode: false });
  const [customWordsInput, setCustomWordsInput] = useState(Array(25).fill(''));
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [areWordsVisible, setAreWordsVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastSoundTimestamp = useRef(0);

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) { console.log(err); }
      }
    };
    if (view === 'table' || view === 'captain') requestWakeLock();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (view === 'table' || view === 'captain')) requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release();
    };
  }, [view]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent) && !window.navigator.standalone) {
      setIsIOS(true);
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error intentando pantalla completa: ${err.message} (${err.name})`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) setRoomCode(roomParam.toUpperCase());
  }, []);

  useEffect(() => {
    if (roomCode) {
      const unsubscribe = onValue(ref(db, `rooms/${roomCode}`), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          if (data.status === 'closed') { exitToHome(); return; }

          if (data.status === 'reset') {
            if (view !== 'role_selection') setView('role_selection');
          } else if (view === 'loading_room' || view === 'home') {
            setView('role_selection');
          }

          setGameData(data);

          const prop = data.proposedCard;
          if (prop !== undefined && prop !== null && prop !== -1) {
            setSelectedCardIndex(prop);
          } else {
            if (prop === -1) {
              setSelectedCardIndex(null);
            }

            if (selectedCardIndex !== null && data.board[selectedCardIndex] && data.board[selectedCardIndex].revealed) {
              setSelectedCardIndex(null);
            }
          }

          if (data.lastSound && data.lastSound.timestamp > lastSoundTimestamp.current) {
            playSound(data.lastSound.type);
            lastSoundTimestamp.current = data.lastSound.timestamp;
          }
        }
      });
      return () => unsubscribe();
    }
  }, [roomCode, view, selectedCardIndex]);

  useEffect(() => {
    if (gameData?.turn) setAreWordsVisible(false);
  }, [gameData?.turn]);

  const exitToHome = () => {
    setRoomCode(''); setGameData(null); setView('home');
    window.history.pushState({}, '', window.location.pathname);
  };
  const updateUrl = (code) => {
    const newUrl = `${window.location.pathname}?room=${code}`;
    window.history.pushState({}, '', newUrl);
  };
  const createRoom = () => {
    if (config.customWordsMode) { setView('custom_setup'); return; }
    initializeGame(null);
  };
  const initializeGame = (customWords) => {
    cleanupOldRooms();
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
    let newCode = "";
    for (let i = 0; i < 4; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(newCode); updateUrl(newCode);
    const startTeam = Math.random() < 0.5 ? 'red' : 'blue';
    const initialChallenge = config.isParty ? "🎨 Dibujo: ¡Haz un dibujo en la pizarra!" : "🎯 Normal: Di una palabra y un número.";
    set(ref(db, `rooms/${newCode}`), {
      board: generateBoard(startTeam, customWords),
      turn: startTeam, challenge: initialChallenge, config: { ...config },
      turnTimestamp: Date.now(), paused: config.hardMode ? true : false,
      drawing: null, proposedCard: null, status: 'active'
    });
    setView('role_selection');
  };
  const joinRoom = (code) => {
    if (!code) return alert("Introduce un código");
    const upperCode = code.toUpperCase(); setRoomCode(upperCode); updateUrl(upperCode); setView('loading_room');
  };
  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setLinkCopied(true);
        } else {
          alert("Copia este enlace manualmente: " + url);
        }
      } catch (e) {
        alert("Copia este enlace manualmente: " + url);
      }
    }
    setTimeout(() => setLinkCopied(false), 2000);
  };
  const goHome = () => { if (confirm("¿Salir?")) exitToHome(); };
  const goHomeFinal = () => {
    if (confirm("¿Seguro que quieres cerrar la sala para todos?")) {
      update(ref(db, `rooms/${roomCode}`), { status: 'closed' }); exitToHome();
    }
  };
  const handleRoleSelection = (role) => setView(role === 'table' ? 'table' : 'captain');

  const handleCardClick = (index) => {
    if (gameData.winner || gameData.board[index].revealed) return;
    if (view === 'table') {
      const newProposal = gameData.proposedCard === index ? -1 : index;
      update(ref(db, `rooms/${roomCode}`), { proposedCard: newProposal });
    } else {
      setSelectedCardIndex(index === selectedCardIndex ? null : index);
    }
  };
  const activateHardModeTurn = () => {
    setAreWordsVisible(true);
    update(ref(db, `rooms/${roomCode}`), { paused: false, turnTimestamp: Date.now() });
  };
  const confirmReveal = () => {
    if (selectedCardIndex === null) return;
    const index = selectedCardIndex;
    const currentBoard = [...gameData.board];
    const card = currentBoard[index];

    let newWinner = null;
    let soundType = 'fallo';

    if (card.type === 'bomb') {
      newWinner = gameData.turn === 'red' ? 'blue' : 'red';
      soundType = 'fallo';
    } else {
      if (card.type === gameData.turn) {
        soundType = 'acierto';
      } else {
        soundType = 'fallo';
      }

      const tempBoard = currentBoard.map((c, i) => i === index ? { ...c, revealed: true } : c);
      const redLeft = tempBoard.filter(c => c.type === 'red' && !c.revealed).length;
      const blueLeft = tempBoard.filter(c => c.type === 'blue' && !c.revealed).length;
      if (redLeft === 0) newWinner = 'red';
      if (blueLeft === 0) newWinner = 'blue';
    }

    const updates = {};
    updates[`rooms/${roomCode}/board/${index}/revealed`] = true;
    updates[`rooms/${roomCode}/proposedCard`] = -1;
    updates[`rooms/${roomCode}/lastSound`] = { type: soundType, timestamp: Date.now() };

    if (newWinner) {
      updates[`rooms/${roomCode}/winner`] = newWinner;
      updates[`rooms/${roomCode}/lastSound`] = { type: 'victoria', timestamp: Date.now() };
    } else if (card.type !== gameData.turn) {
      const nextTurn = gameData.turn === 'red' ? 'blue' : 'red';
      updates[`rooms/${roomCode}/turn`] = nextTurn;
      if (gameData.config.hardMode) updates[`rooms/${roomCode}/paused`] = true;
      else updates[`rooms/${roomCode}/turnTimestamp`] = Date.now();
      if (gameData.config.isParty) updates[`rooms/${roomCode}/drawing`] = null;
    }
    update(ref(db), updates);
    setSelectedCardIndex(null);
  };
  const passTurn = () => {
    const nextTurn = gameData.turn === 'red' ? 'blue' : 'red';
    const updates = { turn: nextTurn, proposedCard: -1 };
    if (gameData.config.hardMode) updates.paused = true;
    else updates.turnTimestamp = Date.now();
    if (gameData.config.isParty) updates.drawing = null;
    update(ref(db, `rooms/${roomCode}`), updates);
  };
  const newGame = () => {
    const startTeam = Math.random() < 0.5 ? 'red' : 'blue';
    const initialChallenge = gameData.config.isParty ? "🎨 Dibujo: ¡Haz un dibujo en la pizarra!" : "🎯 Normal: Di una palabra y un número.";
    set(ref(db, `rooms/${roomCode}`), {
      board: generateBoard(startTeam), turn: startTeam, winner: null,
      challenge: initialChallenge, config: gameData.config,
      turnTimestamp: Date.now(), paused: gameData.config.hardMode, drawing: null, proposedCard: null, status: 'reset'
    });
    setTimeout(() => { update(ref(db, `rooms/${roomCode}`), { status: 'active' }); }, 1000);
  };

  const renderView = () => {
    if (view === 'custom_setup') {
      return <CustomSetupView customWordsInput={customWordsInput} setCustomWordsInput={setCustomWordsInput} initializeGame={initializeGame} setView={setView} />;
    }

    if (view === 'home') {
      return <HomeView config={config} setConfig={setConfig} showRules={showRules} setShowRules={setShowRules} activeInfo={activeInfo} setActiveInfo={setActiveInfo} createRoom={createRoom} joinRoom={joinRoom} isIOS={isIOS} deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} />;
    }

    if (view === 'loading_room') return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500 font-bold animate-pulse">Conectando...</div>;
    if (view === 'role_selection') return <RoleSelectionView roomCode={roomCode} handleRoleSelection={handleRoleSelection} />;
    if (!gameData) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500">Cargando datos...</div>;

    const isCaptain = view === 'captain';
    let privacyShieldActive = false;
    if (isCaptain && gameData.config.hardMode && !areWordsVisible) {
      privacyShieldActive = true;
    }

    return (
      <GameBoard
        gameData={gameData} roomCode={roomCode} view={view} isCaptain={isCaptain}
        privacyShieldActive={privacyShieldActive}
        areWordsVisible={areWordsVisible} selectedCardIndex={selectedCardIndex}
        showRules={showRules} setShowRules={setShowRules}
        showDrawing={showDrawing} setShowDrawing={setShowDrawing}
        goHome={goHome} copyLink={copyLink} linkCopied={linkCopied}
        activateHardModeTurn={activateHardModeTurn} confirmReveal={confirmReveal}
        passTurn={passTurn} newGame={newGame} goHomeFinal={goHomeFinal}
        handleCardClick={handleCardClick}
      />
    );
  };

  return (
    <>
      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/85 z-[100] flex flex-col items-center justify-end p-4 sm:p-6 pb-12 animate-fadeIn" onClick={() => setShowIOSPrompt(false)}>
          <div className="bg-slate-100 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-slideUp border border-gray-300 relative text-black" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIOSPrompt(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-xl px-2">✕</button>

            <div className="flex flex-col items-center mt-2">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-4">🕵️‍♂️</div>
              <h3 className="font-bold text-2xl text-center leading-tight">Instala <br /><span className="text-blue-600">Código Secreto</span></h3>
              <p className="text-center text-gray-500 mt-2 text-sm">Añade esta web a tu pantalla de inicio para jugar a pantalla completa y sin interrupciones.</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mt-2 text-sm text-gray-700 space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-blue-500 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xl shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" /></svg>
                </div>
                <p>1. Toca en el botón de <b>Compartir</b> de tu navegador (está en la barra inferior o superior).</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-900 w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
                </div>
                <p>2. Desplázate hacia abajo y selecciona <b>Añadir a la pantalla de inicio</b>.</p>
              </div>
            </div>

            <button onClick={() => setShowIOSPrompt(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors mt-2 active:scale-95">¡Entendido!</button>
          </div>
        </div>
      )}

      {renderView()}

      <button
        onClick={toggleFullscreen}
        className="fixed bottom-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur transition border border-white/20 active:scale-90"
        title="Pantalla Completa"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M15 9V4.5M15 9h4.5M9 15v4.5M9 15H4.5M15 15v4.5M15 15h4.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        )}
      </button>
    </>
  );
}
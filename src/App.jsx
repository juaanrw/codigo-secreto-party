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

  if (view === 'custom_setup') {
    return <CustomSetupView customWordsInput={customWordsInput} setCustomWordsInput={setCustomWordsInput} initializeGame={initializeGame} setView={setView} />;
  }

  if (view === 'home') {
    return <HomeView config={config} setConfig={setConfig} showRules={showRules} setShowRules={setShowRules} activeInfo={activeInfo} setActiveInfo={setActiveInfo} createRoom={createRoom} joinRoom={joinRoom} />;
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
}
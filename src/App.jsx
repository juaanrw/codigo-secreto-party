import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { ref, set, onValue, update } from "firebase/database";
import { generateBoard, cleanupOldRooms, playSound } from './utils';

import HomeView from './views/HomeView';
import CustomSetupView from './views/CustomSetupView';
import RoleSelectionView from './views/RoleSelectionView';
import GameBoard from './views/GameBoard';

<<<<<<< HEAD
=======
      for (const [key, room] of Object.entries(rooms)) {
        if (room.turnTimestamp && (now - room.turnTimestamp > ONE_DAY)) {
          remove(ref(db, `rooms/${key}`));
        }
      }
    }
  } catch (error) {
    console.error("Error limpiando salas:", error);
  }
};

// --- COMPONENTE CARTA ---
export const Card = ({ data, viewMode, onClick, isSelected, isProposed }) => {
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

  let baseClass = `w-full h-20 md:h-28 lg:h-32 rounded-lg flex items-center justify-center font-bold text-sm md:text-xl select-none transition-all shadow-md p-1 text-center break-words leading-tight border-b-4 active:border-b-0 active:translate-y-1 relative`;

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

// --- SISTEMA DE SONIDO ---
const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.5;
  audio.play().catch(e => console.log("Audio play failed", e));
};

// --- PIZARRA ---
export const DrawingBoard = ({ isOpen, onClose, isCaptain, roomCode, existingImage }) => {
  const canvasRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canDraw, setCanDraw] = useState(false);
  const [localImage, setLocalImage] = useState(existingImage);
  const [sessionFinished, setSessionFinished] = useState(false);

  useEffect(() => {
    setLocalImage(existingImage);
    if (existingImage && !canDraw && timeLeft === 10) setSessionFinished(true);
    if (!existingImage) {
      setSessionFinished(false);
      setLocalImage(null);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [existingImage, canDraw, timeLeft]);

  useEffect(() => {
    let interval;
    if (isCaptain && canDraw && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && canDraw) finishDrawing();
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canDraw, timeLeft, isCaptain]);

  const startDrawingSession = () => {
    setCanDraw(true);
    setSessionFinished(false);
    setTimeLeft(10);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }, 50);
  };

  const finishDrawing = () => {
    setCanDraw(false);
    setSessionFinished(true);
    saveToFirebase();
  };

  const saveToFirebase = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    update(ref(db, `rooms/${roomCode}`), { drawing: dataUrl });
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  const startDraw = (e) => {
    if (!canDraw) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!canDraw) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y); ctx.stroke(); e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white p-4 rounded-xl w-full max-w-sm flex flex-col gap-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-black font-bold text-xl px-2">✕</button>
        <h3 className="text-black font-black text-2xl text-center uppercase">🎨 Pizarra</h3>
        <div className="relative border-4 border-black w-full h-64 bg-white touch-none cursor-crosshair rounded overflow-hidden">
          {isCaptain && canDraw ? (
            <canvas ref={canvasRef} width={320} height={256} className="w-full h-full"
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={saveToFirebase} onMouseLeave={saveToFirebase}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={saveToFirebase}
              style={{ width: '100%', height: '100%' }} />
          ) : (
            localImage ? <img src={localImage} alt="Dibujo" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 italic">Esperando dibujo...</div>
          )}
        </div>
        {isCaptain ? (
          !sessionFinished && !canDraw ? <button onClick={startDrawingSession} className="w-full bg-slate-200 text-black font-bold py-3 rounded-lg hover:scale-105 transition">✏️ EMPEZAR DIBUJO (10s)</button> :
            canDraw ? <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden border border-gray-400 relative"><div className="bg-red-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 10) * 100}%` }}></div><div className="absolute inset-x-0 text-center text-xs font-bold text-black leading-6 z-10">TIEMPO: {timeLeft}s</div></div> :
              <div className="text-center text-sm font-bold text-gray-500 bg-gray-200 p-2 rounded">DIBUJO FINALIZADO</div>
        ) : <p className="text-center text-sm text-gray-500">Solo el capitán actual puede dibujar.</p>}
      </div>
    </div>
  );
};

// --- TIMER ---
export const Timer = ({ turnTimestamp, turnDuration, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(turnDuration);
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - turnTimestamp) / 1000);
      const remaining = turnDuration - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [turnTimestamp, turnDuration, isPaused]);
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60) < 10 ? '0' : ''}${seconds % 60}`;
  return <div className={`font-mono font-bold text-xl px-3 py-1 rounded flex items-center gap-2 ${timeLeft < 10 && !isPaused ? 'bg-red-600 animate-pulse' : 'bg-black/50'}`}>{isPaused ? <span className="text-yellow-400">⏸️ ESPERA</span> : `⏱ ${formatTime(timeLeft)}`}</div>;
};

// --- MODALES ---
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

// --- FONDO ANIMADO ---
const AnimatedBackground = () => {
  const squares = Array.from({ length: 60 });
  return <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none"><div className="grid grid-cols-6 md:grid-cols-10 gap-2 h-full w-full p-2 opacity-40">{squares.map((_, i) => <BgSquare key={i} />)}</div><div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[2px]"></div></div>;
};

const random = Math.random();
const bgSquareColors = ["bg-amber-200", "bg-amber-200", "bg-amber-200", "bg-red-600", "bg-blue-600", "bg-gray-900"];
const BgSquare = () => {
  const [color, setColor] = useState(bgSquareColors[Math.floor(random * bgSquareColors.length)]);
  useEffect(() => {
    const interval = setInterval(() => { setColor(bgSquareColors[Math.floor(Math.random() * bgSquareColors.length)]); }, 2000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);
  return <div className={`w-full h-full rounded-md transition-colors duration-[2000ms] ease-in-out ${color}`} />;
};

// --- COMPONENTE INTERNO DEL BOTÓN INFO ---
const InfoBtn = ({ title, desc, onInfoClick }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onInfoClick({ title, desc }); }}
    className="w-6 h-6 rounded-full bg-slate-600 text-xs font-bold flex items-center justify-center hover:bg-slate-200 hover:text-black transition"
  >
    ?
  </button>
);

// --- APP PRINCIPAL ---
/* v8 ignore start */
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
export default function App() {
  const [view, setView] = useState('home');

  const [roomCode, setRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    return roomParam ? roomParam.toUpperCase() : '';
  });

  const [gameData, setGameData] = useState(null);

  const [showRules, setShowRules] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);
  const [showDrawing, setShowDrawing] = useState(false);

  const [config, setConfig] = useState({ isParty: false, useTimer: false, hardMode: false, customWordsMode: false });
  const [customWordsInput, setCustomWordsInput] = useState(Array(25).fill(''));
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [areWordsVisible, setAreWordsVisible] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastSoundTimestamp = useRef(0);
<<<<<<< HEAD

=======
  const prevTurn = useRef(null);

  // --- WAKE LOCK ---
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
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

<<<<<<< HEAD
=======
  // --- instalación PWA ---
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
  useEffect(() => {
    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      // Evita que aparezca la barra de información en el móvil
      e.preventDefault();
      // Guarda el evento para poder activarlo más tarde.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

<<<<<<< HEAD
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
=======
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
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d

  // --- Pantalla completa ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error intentando pantalla completa: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

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
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
<<<<<<< HEAD
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
=======
        textArea.style.position = "fixed"; textArea.style.left = "-9999px"; textArea.style.top = "0";
        document.body.appendChild(textArea); textArea.focus(); textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) setLinkCopied(true);
        else alert("Copia este enlace manualmente: " + url);
      } catch { alert("Copia este enlace manualmente: " + url); }
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
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
<<<<<<< HEAD
      if (card.type === gameData.turn) {
        soundType = 'acierto';
      } else {
        soundType = 'fallo';
      }
=======
      if (card.type === gameData.turn) soundType = 'acierto';
      else soundType = 'fallo';
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d

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

<<<<<<< HEAD
=======
  // --- SYNC FIREBASE ---
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
          // Detectamos si el turno ha cambiado respecto a lo que teníamos
          if (data.turn && data.turn !== prevTurn.current) {
            setAreWordsVisible(false); // Reseteamos visibilidad
            prevTurn.current = data.turn; // Actualizamos referencia
          }

          setGameData(data);

          const prop = data.proposedCard;
          if (prop !== undefined && prop !== null && prop !== -1) {
            setSelectedCardIndex(prop);
          } else {
            if (prop === -1) setSelectedCardIndex(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, view]);

  // --- VISTAS ---
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
  if (view === 'custom_setup') {
    return <CustomSetupView customWordsInput={customWordsInput} setCustomWordsInput={setCustomWordsInput} initializeGame={initializeGame} setView={setView} />;
  }

  if (view === 'home') {
<<<<<<< HEAD
    return <HomeView config={config} setConfig={setConfig} showRules={showRules} setShowRules={setShowRules} activeInfo={activeInfo} setActiveInfo={setActiveInfo} createRoom={createRoom} joinRoom={joinRoom} />;
=======
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
                <InfoBtn title="Modo Dibujo (Pictionary)" desc="El capitán NO puede hablar. Todas las pistas se darán dibujando en la pizarra interactiva." onInfoClick={setActiveInfo} />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.useTimer} onChange={(e) => setConfig({ ...config, useTimer: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>⏱️ Temporizador</span></label>
                <InfoBtn title="Temporizador" desc="Activa una cuenta atrás de 2 minutos por turno para agilizar la partida." onInfoClick={setActiveInfo} />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.hardMode} onChange={(e) => setConfig({ ...config, hardMode: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>💀 Modo Difícil</span></label>
                <InfoBtn title="Modo Difícil" desc="Privacidad total: Los capitanes comparten un dispositivo y la pantalla se oculta al cambiar de turno." onInfoClick={setActiveInfo} />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={config.customWordsMode} onChange={(e) => setConfig({ ...config, customWordsMode: e.target.checked })} className="w-5 h-5 accent-amber-500" /><span>✍️ Palabras Propias</span></label>
                <InfoBtn title="Palabras Personalizadas" desc="Permite escribir manualmente las 25 palabras antes de empezar la partida." onInfoClick={setActiveInfo} />
              </div>
            </div>
            <button onClick={createRoom} className="w-full bg-slate-200 hover:bg-amber-400 text-black font-black py-4 rounded-xl text-lg shadow-lg active:scale-95">CREAR PARTIDA</button>
            <div className="flex gap-2 border-t border-slate-700 pt-4"><input type="text" placeholder="CÓDIGO" id="codeInput" maxLength={4} className="w-full p-3 rounded-lg text-black bg-slate-200 uppercase font-bold text-center text-lg" /><button onClick={() => joinRoom(document.getElementById('codeInput').value)} className="bg-blue-600 hover:bg-blue-500 font-bold px-6 rounded-lg text-white">ENTRAR</button></div>
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
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
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
<<<<<<< HEAD
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
=======
    <div className={`min-h-screen ${bgColor} transition-colors duration-700 flex flex-col pb-20`}>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      <DrawingBoard isOpen={showDrawing} onClose={() => setShowDrawing(false)} isCaptain={isCaptain && !privacyShieldActive} roomCode={roomCode} existingImage={gameData.drawing} />

      {/* MODAL IOS INSTRUCCIONES */}
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

      <div className="bg-slate-900/90 backdrop-blur text-white p-2 shadow-lg flex justify-between items-center sticky top-0 z-30">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1"><button onClick={goHome} className="bg-slate-700 p-1.5 rounded w-8 h-8">🏠</button><button onClick={() => setShowRules(true)} className="bg-slate-700 p-1.5 rounded w-8 h-8 font-bold">?</button></div>
          <div className="flex flex-col cursor-pointer" onClick={copyLink}>
            <span className="text-[10px] text-gray-400 font-bold tracking-widest flex items-center gap-1">SALA {linkCopied && <span className="text-green-400"> (COPIADO)</span>}</span>
            <div className="flex items-center gap-2"><span className="text-xl font-black text-amber-500 tracking-widest leading-none">{roomCode}</span><span className="text-gray-500 text-xs">🔗</span></div>
          </div>
        </div>
        {(isDrawingChallenge || gameData.drawing) && <button onClick={() => setShowDrawing(true)} className="bg-white text-black p-2 rounded-full shadow-lg animate-bounce-slow font-bold text-xl" title="Abrir Pizarra">🎨</button>}
        <div className="flex items-center gap-3 bg-black/40 px-3 py-1 rounded-full border border-white/10"><div className={`text-2xl font-black ${isRedTurn ? 'scale-110' : 'opacity-60'} text-red-500`}>{redLeft}</div><div className="h-5 w-px bg-gray-500"></div><div className={`text-2xl font-black ${!isRedTurn ? 'scale-110' : 'opacity-60'} text-blue-500`}>{blueLeft}</div></div>
        <div>{gameData.config.useTimer ? <Timer turnTimestamp={gameData.turnTimestamp} turnDuration={120} isPaused={gameData.paused} /> : <span className={`font-bold px-2 py-1 rounded text-sm ${isRedTurn ? 'bg-red-600' : 'bg-blue-600'}`}>{isRedTurn ? ' TURNO DEL ROJO' : 'TURNO DEL AZUL'}</span>}</div>
      </div>

      <div className="flex-1 p-2 md:p-6 w-full max-w-5xl mx-auto relative">
        {privacyShieldActive && !gameData.winner && (
          <div className="absolute inset-0 z-40 bg-slate-800 flex flex-col items-center justify-center p-6 text-center rounded-lg m-2 border-4 border-slate-600">
            <h2 className="text-3xl font-black text-white mb-2">ALTO AHÍ</h2><p className="text-gray-400 mb-8">Pasa el dispositivo al Capitán:</p><div className={`text-4xl font-black mb-10 ${isRedTurn ? 'text-red-500' : 'text-blue-500'} uppercase animate-pulse`}>{isRedTurn ? 'ROJO 🔴' : 'AZUL 🔵'}</div>
            <button onClick={activateHardModeTurn} className="bg-white text-black font-bold py-4 px-8 rounded-full shadow-xl hover:scale-105 transition">SOY EL CAPITÁN</button>
          </div>
        )}
        {gameData.config.isParty && (
          <div className="bg-slate-200 text-black p-3 text-center font-bold rounded-lg shadow-lg mb-4 mx-auto max-w-md flex flex-col"><span className="text-sm uppercase opacity-70">RETO:</span><span className="text-lg">{gameData.challenge}</span>{isDrawingChallenge && <span className="text-xs mt-1 bg-black/10 rounded px-2">Pulsa 🎨 arriba para dibujar</span>}</div>
        )}
        <div className="grid grid-cols-5 gap-2 md:gap-4 content-start">
          {gameData.board.map((card, i) => (
            <Card key={i} data={card} viewMode={cardViewMode} isSelected={selectedCardIndex === i} isProposed={gameData.proposedCard === i} onClick={() => !privacyShieldActive ? handleCardClick(i) : null} />
          ))}
        </div>
      </div>

      {isCaptain && (
        <div className="fixed bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col gap-2 z-40">
          {selectedCardIndex !== null && gameData.board[selectedCardIndex] && !gameData.winner && (
            <button onClick={confirmReveal} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-xl shadow-lg active:scale-95 text-lg animate-bounce-short">
              👆 REVELAR "{gameData.board[selectedCardIndex].word}"
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
          <div className="bg-slate-900/95 border-t-4 border-amber-500 rounded-t-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="text-center md:text-left"><p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">PARTIDA FINALIZADA</p><h2 className={`text-4xl md:text-5xl font-black ${gameData.winner === 'red' ? 'text-red-500' : 'text-blue-500'}`}>¡GANA EL {gameData.winner === 'red' ? 'ROJO' : 'AZUL'}!</h2></div>
            <div className="flex gap-4 w-full md:w-auto"><button onClick={goHomeFinal} className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition">🏠 SALIR</button><button onClick={newGame} className="flex-1 md:flex-none bg-white hover:scale-105 text-black font-black py-3 px-8 rounded-xl shadow-lg transition animate-pulse">JUGAR OTRA VEZ ↻</button></div>
          </div>
        </div>
      )}

      {/* --- BOTÓN PANTALLA COMPLETA FLOTANTE --- */}
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

    </div>
>>>>>>> f379ac983451cdd86ff21c7d0c9a02a0e30bb75d
  );
}
/* v8 ignore stop */
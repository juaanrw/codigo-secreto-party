import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, update, get } from "firebase/database";

const DrawingBoard = ({ isOpen, onClose, isCaptain, roomCode, existingImage }) => {
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
        saveDrawingFinal();
    };

    const saveDrawingFinal = async () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL("image/png");

        try {
            const roomRef = ref(db, `rooms/${roomCode}`);
            const snapshot = await get(roomRef);
            if (snapshot.exists()) {
                const roomData = snapshot.val();
                let newDrawings = Array.isArray(roomData.drawings) ? [...roomData.drawings] : [];
                newDrawings.push(dataUrl);

                await update(roomRef, {
                    drawing: dataUrl,
                    drawings: newDrawings
                });
            } else {
                await update(roomRef, { drawing: dataUrl });
            }
        } catch (error) {
            console.error("Error saving drawing to Firebase:", error);
            update(ref(db, `rooms/${roomCode}`), { drawing: dataUrl });
        }
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
                            <div className="flex gap-2 w-full">
                                <div className="flex-1 text-center text-sm font-bold text-gray-500 bg-gray-200 p-2 rounded flex items-center justify-center">FINALIZADO</div>
                                <button onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = localImage;
                                    a.download = `dibujo-cs-${roomCode}.png`;
                                    a.click();
                                }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition flex items-center gap-1 shadow">💾 <span className="hidden sm:inline">Descargar</span></button>
                            </div>
                ) : (
                    sessionFinished || (existingImage && !canDraw && timeLeft === 10) ? (
                        <div className="flex gap-2 w-full mt-2">
                            <div className="flex-1 text-center text-sm font-bold text-gray-500 bg-gray-200 p-2 rounded flex items-center justify-center">DIBUJO FINALIZADO</div>
                            {localImage && <button onClick={() => {
                                const a = document.createElement('a');
                                a.href = localImage;
                                a.download = `dibujo-cs-${roomCode}.png`;
                                a.click();
                            }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm transition flex items-center gap-1 shadow">💾 <span className="hidden sm:inline">Descargar</span></button>}
                        </div>
                    ) : <p className="text-center text-sm text-gray-500">Solo el capitán actual puede dibujar.</p>
                )}
            </div>
        </div>
    );
};

export default DrawingBoard;

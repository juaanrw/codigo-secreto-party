import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timer } from '../App';

describe('Componente <Timer />', () => {
    beforeEach(() => {
        vi.useFakeTimers(); // "Secuestramos" el reloj del sistema
    });

    afterEach(() => {
        vi.useRealTimers(); // Lo devolvemos al final
    });

    it('Renderiza el tiempo inicial correctamente', () => {
        // Simulamos que el turno empezó hace 0 segundos
        render(<Timer turnTimestamp={Date.now()} turnDuration={120} isPaused={false} />);
        expect(screen.getByText(/2:00/)).toBeInTheDocument();
    });

    it('Avanza el tiempo visualmente', () => {
        render(<Timer turnTimestamp={Date.now()} turnDuration={120} isPaused={false} />);
        
        // Avanzamos el reloj 10 segundos mágicamente
        act(() => {
            vi.advanceTimersByTime(10000); 
        });

        // Debería poner 1:50
        expect(screen.getByText(/1:50/)).toBeInTheDocument();
    });
});
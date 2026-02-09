import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from '../App'; // Importamos el componente exportado

describe('Componente <Card />', () => {
    const mockDataRed = { word: 'SOL', type: 'red', revealed: false };
//    const mockDataBomb = { word: 'BOOM', type: 'bomb', revealed: false };

    it('Muestra la palabra correctamente', () => {
        render(<Card data={mockDataRed} viewMode="table" onClick={() => {}} />);
        expect(screen.getByText('SOL')).toBeInTheDocument();
    });

    // TEST DE LÓGICA VISUAL: MODO MESA
    it('En modo MESA, las cartas no reveladas deben parecer neutrales', () => {
        render(<Card data={mockDataRed} viewMode="table" onClick={() => {}} />);
        
        const cardDiv = screen.getByText('SOL');
        expect(cardDiv.className).not.toContain('bg-red-600');
        expect(cardDiv.className).toContain('bg-amber-100');
    });

    // TEST DE LÓGICA VISUAL: MODO CAPITÁN
    it('En modo CAPITÁN GOD, se deben ver los colores reales', () => {
        render(<Card data={mockDataRed} viewMode="captain_god" onClick={() => {}} />);
        
        const cardDiv = screen.getByText('SOL');
        expect(cardDiv.className).toContain('bg-red-600');
    });

    // TEST DE INTERACCIÓN
    it('Llama a la función onClick al hacer click', () => {
        const handleClick = vi.fn(); // Creamos una función espía (mock)
        render(<Card data={mockDataRed} viewMode="table" onClick={handleClick} />);
        
        fireEvent.click(screen.getByText('SOL'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // TEST VISUAL: CARTA REVELADA
    it('Si está revelada, muestra la etiqueta VISTO', () => {
        const revealedData = { ...mockDataRed, revealed: true };
        render(<Card data={revealedData} viewMode="table" onClick={() => {}} />);
        
        expect(screen.getByText('VISTO')).toBeInTheDocument();
    });
});
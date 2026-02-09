import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RulesModal, InfoModal } from '../App'; // Importas los componentes sueltos

describe('Componentes de Interfaz (Modales)', () => {
    
    // TEST DEL MODAL DE REGLAS
    it('RulesModal renderiza las secciones principales', () => {
        render(<RulesModal onClose={() => {}} />);
        
        expect(screen.getByText('📜 REGLAS DEL JUEGO')).toBeInTheDocument();
        expect(screen.getByText(/1. Preparación y Equipos/i)).toBeInTheDocument();
        expect(screen.getByText(/⚠️ CÓDIGO DE HONOR/i)).toBeInTheDocument();
    });

    it('RulesModal llama a onClose al pulsar el botón', () => {
        const handleClose = vi.fn();
        render(<RulesModal onClose={handleClose} />);
        
        fireEvent.click(screen.getByText('¡ENTENDIDO!'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    // TEST DEL MODAL DE INFO
    it('InfoModal muestra el título y texto correctos', () => {
        const titulo = "Modo Fiesta";
        const texto = "Explicación del modo fiesta";
        
        render(<InfoModal title={titulo} text={texto} onClose={() => {}} />);
        
        expect(screen.getByText(titulo)).toBeInTheDocument();
        expect(screen.getByText(texto)).toBeInTheDocument();
    });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RulesModal, InfoModal, DrawingGalleryModal } from '../components/Modals';

describe('Componentes de Interfaz (Modales)', () => {

    // TEST DEL MODAL DE REGLAS
    it('RulesModal renderiza las secciones principales', () => {
        render(<RulesModal onClose={() => { }} />);

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

        render(<InfoModal title={titulo} text={texto} onClose={() => { }} />);

        expect(screen.getByText(titulo)).toBeInTheDocument();
        expect(screen.getByText(texto)).toBeInTheDocument();
    });

    // TEST DEL MODAL DE GALERIA
    it('DrawingGalleryModal renderiza imágenes, texto vacío y permite cerrar', () => {
        const handleClose = vi.fn();
        const fakeDrawings = ["data:image/png;base64,mock1", "data:image/png;base64,mock2"];

        render(<DrawingGalleryModal drawings={fakeDrawings} onClose={handleClose} />);

        // Verifica que se renderiza el titulo
        expect(screen.getByText('🖼️ Galería de Dibujos')).toBeInTheDocument();

        // Verifica que hay 2 imágenes
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);

        // Verifica el botón de cerrar
        fireEvent.click(screen.getByText('✕'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('DrawingGalleryModal no renderiza nada si no hay dibujos', () => {
        const { container } = render(<DrawingGalleryModal drawings={null} onClose={() => { }} />);
        expect(container.firstChild).toBeNull();
    });
});
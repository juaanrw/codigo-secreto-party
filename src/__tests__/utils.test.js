import { describe, it, expect, vi } from 'vitest';
import { generateBoard, playSound } from '../utils';

vi.mock('../firebase', () => ({
    db: {}
}));
vi.mock('firebase/database', () => ({
    ref: vi.fn(),
    get: vi.fn(),
    remove: vi.fn()
}));

describe('utils', () => {
    describe('Lógica del Juego (utils)', () => {
        it('Debe generar un tablero de 25 cartas', () => {
            const board = generateBoard('red');
            expect(board).toHaveLength(25);
        });

        it('El equipo que empieza debe tener 9 cartas', () => {
            const startTeam = 'red';
            const board = generateBoard(startTeam);
            const redCards = board.filter(card => card.type === 'red');
            expect(redCards).toHaveLength(9);
        });

        it('El equipo que NO empieza debe tener 8 cartas', () => {
            const startTeam = 'red';
            const board = generateBoard(startTeam);
            const blueCards = board.filter(card => card.type === 'blue');
            expect(blueCards).toHaveLength(8);
        });

        it('Debe haber siempre 1 asesino', () => {
            const board = generateBoard('blue');
            const assassin = board.filter(card => card.type === 'bomb');
            expect(assassin).toHaveLength(1);
        });

        it('usa palabras customizadas si se proporcionan 25', () => {
            const customWords = Array.from({ length: 25 }, (_, i) => `Palabra${i}`);
            const board = generateBoard('blue', customWords);
            expect(board.length).toBe(25);
            const hasCustomWord = board.some(card => card.word.includes('Palabra'));
            expect(hasCustomWord).toBe(true);
        });
    });

    describe('playSound', () => {
        it('ejecuta un sonido sin romper la aplicación', async () => {
            // Mock global Audio
            const mockPlay = vi.fn().mockResolvedValue(true);
            vi.stubGlobal('Audio', vi.fn().mockImplementation(function () {
                return {
                    play: mockPlay,
                    volume: 1
                };
            }));

            // Solo comprobamos que no lanza throws
            expect(() => {
                playSound('hit');
            }).not.toThrow();
        });
    });
});
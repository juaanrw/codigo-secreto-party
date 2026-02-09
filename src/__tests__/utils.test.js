import { describe, it, expect } from 'vitest';
import { generateBoard } from '../utils'; // Asegúrate de que la ruta es correcta

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
});
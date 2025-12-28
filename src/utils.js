// Algoritmo de mezcla profesional (Fisher-Yates)
const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Puedes añadir aquí hasta 1000 palabras
const HUGE_WORD_LIST = [
  "Abogado", "Aceite", "África", "Agente", "Agua", "Águila", "Aguja", "Agujero", "Aire", "Alemania", "Algodón", "Alianza", "Alpes", "Ambulancia", "América", "Ángel", "Anillo", "Antártida", "Antorcha", "Araña", "Archivo", "Arco", "Argentina", "Artículo", "As", "Atlántida", "Australia", "Avión", "Azúcar", "Bala", "Ballena", "Banco", "Banda", "Baño", "Barco", "Barra", "Batería", "Berlín", "Bermudas", "Bicho", "Bocina", "Boda", "Bola", "Bolso", "Bomba", "Bosque", "Bota", "Botella", "Botón", "Brazo", "Bruja", "Caballero", "Caballo", "Cabeza", "Cabina", "Cabo", "Cactus", "Cadena", "Caja", "Cama", "Cámara", "Cambio", "Campana", "Campo", "Canal", "Canguro", "Canto", "Caña", "Capa", "Capital", "Cara", "Caravana", "Carga", "Carrera", "Carro", "Carta", "Casco", "Casino", "Castillo", "Causa", "Célula", "Cementerio", "Centauro", "Centro", "Ciclo", "Cierre", "Cine", "Cinta", "Círculo", "Clavo", "Coche", "Cocina", "Coco", "Código", "Cola", "Cólera", "Columna", "Cometa", "Compás", "Concierto", "Conejo", "Contrabandista", "Copa", "Corazón", "Corchete", "Cordón", "Corona", "Corredor", "Corriente", "Corte", "Corteza", "Costa", "Craneo", "Crema", "Criada", "Cruz", "Cuadro", "Cuarto", "Cubierta", "Cubo", "Cuchillo", "Cuello", "Cuerda", "Cuerno", "Cura", "Dama", "Danza", "Dedo", "Defensa", "Delta", "Dentista", "Día", "Diamante", "Diana", "Diario", "Diente", "Dinosaurio", "Disco", "Disfraz", "División", "Doctor", "Don", "Dragón", "Duende", "Egipto", "Embajada", "Emperador", "Enano", "Enfermedad", "Enfermera", "Enlace", "Escorpión", "Espacio", "Espía", "Estación", "Estadio", "Estado", "Estrella", "Estudio", "Etiqueta", "Euro", "Europa", "Examen", "Falda", "Fantasma", "Faro", "Ficha", "Fiesta", "Figura", "Fila", "Flauta", "Flecha", "Fondo", "Forma", "Fórmula", "Frente", "Fuego", "Fuente", "Fuerza", "Furgoneta", "Gancho", "Gato", "Genio", "Gigante", "Golpe", "Goma", "Grado", "Granada", "Grano", "Grecia", "Grifo", "Guante", "Guardia", "Guerra", "Gusano", "Hada", "Helado", "Helicóptero", "Hierba", "Hierro", "Hielo", "Himalaya", "Historia", "Hoja", "Hollywood", "Hoguera", "Hospital", "Hotel", "Huevo", "Humo", "Iglesia", "Imagen", "Imán", "India", "Indice", "Inglaterra", "Insecto", "Isla", "Jardín", "Jefe", "Jeringuilla", "Juego", "Júpiter", "Juzgado", "Kiwi", "Ladrón", "Lago", "Lama", "Lámpara", "Lana", "Lanza", "Lapa", "Lata", "Leche", "Lengua", "León", "Libra", "Lima", "Limusina", "Línea", "Lista", "Llama", "Llave", "Loquera", "Londres", "Loro", "Luna", "Luz", "Maestro", "Magia", "Mano", "Manzana", "Mapa", "Marco", "Marcha", "Marfil", "Masa", "Mazo", "Médico", "Mesa", "Metro", "México", "Microscopio", "Miel", "Millonario", "Mina", "Misil", "Modelo", "Muelle", "Muerte", "Muñeca", "Muro", "Naranja", "Nave", "Navidad", "Nieve", "Nilo", "Ninja", "Noche", "Nota", "Nudo", "Nuez", "Obra", "Ojo", "Ola", "Olimpiadas", "Operación", "Órgano", "Orquesta", "Oso", "Pala", "Palma", "Pantalla", "Papel", "Paracaídas", "Pase", "Pasta", "Pastel", "Pavo", "Pera", "Perro", "Pesca", "Pez", "Pie", "Pila", "Piloto", "Pincho", "Pingüino", "Pinta", "Piña", "Píramide", "Pis", "Pista", "Pistola", "Placa", "Plano", "Planta", "Plátano", "Playa", "Plomo", "Pluma", "Policía", "Pollo", "Polvo", "Portada", "Portero", "Pozo", "Prensa", "Prismáticos", "Punto", "Puente", "Puerto", "Pulpo", "Pulso", "Punta", "Radio", "Rascacielos", "Ratón", "Rayo", "Red", "Regla", "Reina", "Reserva", "Revolución", "Rey", "Robot", "Roca", "Roma", "Ronda", "Rosa", "Ruleta", "Sable", "Sáhara", "Sal", "Salsa", "Saturno", "Seguro", "Semilla", "Serpiente", "Sierra", "Signo", "Silla", "Sirena", "Sobre", "Soldado", "Sombrero", "Suela", "Suerte", "Superhéroe", "Tabla", "Tableta", "Taco", "Tacto", "Talón", "Tanque", "Tapa", "Tarde", "Teatro", "Teclado", "Telescopio", "Testigo", "Tiempo", "Tienda", "Tierra", "Tokio", "Tornillo", "Torre", "Trama", "Traje", "Transporte", "Tren", "Triángulo", "Trompa", "Trompeta", "Trono", "Tubo", "Tuerca", "Tulipán", "Unicornio", "Vaca", "Vado", "Vampiro", "Vela", "Veneno", "Venus", "Vestido", "Vida", "Vidrio", "Viento", "Vino", "Violeta", "Volcán", "Vuelta", "Washington", "Zapato", "Zanahoria"
];


export const generateBoard = (startingTeam = 'red', customWords = null) => {
  let selectedWords;

  if (customWords && customWords.length === 25) {
    selectedWords = shuffle([...customWords]);
  } else {
    const source = HUGE_WORD_LIST;
    const allShuffled = shuffle([...source]);
    selectedWords = allShuffled.slice(0, 25);
  }
  const redCount = startingTeam === 'red' ? 9 : 8;
  const blueCount = startingTeam === 'blue' ? 9 : 8;

  const roles = [
    ...Array(redCount).fill('red'),
    ...Array(blueCount).fill('blue'),
    ...Array(1).fill('bomb'),
    ...Array(7).fill('neutral')
  ];

  const shuffledRoles = shuffle(roles);

  return selectedWords.map((word, index) => ({
    id: index,
    word,
    type: shuffledRoles[index], 
    revealed: false
  }));
};

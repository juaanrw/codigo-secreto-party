const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const HUGE_WORD_LIST = [
  "Abogado", "Aceite", "África", "Agente", "Agua", "Águila", "Aguja", "Agujero", "Aire", "Alemania", 
  "Alfombra", "Algodón", "Alianza", "Almohada", "Alpes", "Ambulancia", "América", "Ángel", "Anillo", "Antártida", 
  "Antorcha", "Araña", "Archivo", "Arco", "Argentina", "Armario", "Arte", "Artículo", "As", "Astronauta", 
  "Atlántida", "Australia", "Autobús", "Aventura", "Avión", "Azúcar", "Bala", "Ballena", "Banco", "Banda", 
  "Baño", "Barco", "Barra", "Basura", "Batalla", "Batería", "Berlín", "Bermudas", "Bicho", "Bicicleta", 
  "Billete", "Biología", "Bocina", "Boda", "Bola", "Bolígrafo", "Bolsa", "Bolso", "Bomba", "Bosque", 
  "Bosquejo", "Bota", "Botella", "Botica", "Botón", "Brazo", "Bruja", "Caballero", "Caballo", "Cabeza", 
  "Cabina", "Cabo", "Cactus", "Cadena", "Caja", "Cajero", "Cajón", "Cama", "Cámara", "Cambio", 
  "Camino", "Campamento", "Campana", "Campo", "Canal", "Canción", "Cangrejo", "Canguro", "Canto", "Caña", 
  "Capa", "Capital", "Cara", "Caramelo", "Caravana", "Carga", "Carne", "Carpeta", "Carrera", "Carro", 
  "Carta", "Cartera", "Casco", "Casino", "Castillo", "Causa", "Cazuela", "Cebra", "Célula", "Cementerio", 
  "Centauro", "Centro", "Cerdo", "Cereal", "Cerveza", "Chaqueta", "Cheque", "Chocolate", "Ciclo", "Científico", 
  "Cierre", "Cine", "Cinta", "Círculo", "Ciudad", "Clavo", "Coche", "Cocina", "Coco", "Código", 
  "Cofre", "Cojín", "Cola", "Cólera", "Color", "Columna", "Comedia", "Cometa", "Compás", "Computadora", 
  "Concierto", "Conejo", "Continente", "Contrabandista", "Copa", "Corazón", "Corbata", "Corchete", "Cordón", "Corona", 
  "Corredor", "Corriente", "Corte", "Corteza", "Costa", "Craneo", "Cráter", "Crema", "Criada", "Cruz", 
  "Cuadro", "Cuarto", "Cubierta", "Cubo", "Cuchara", "Cuchillo", "Cuello", "Cuento", "Cuerda", "Cuerno", 
  "Cumpleaños", "Cura", "Dama", "Danza", "Dedo", "Defensa", "Delta", "Dentista", "Deporte", "Desayuno", 
  "Desierto", "Destino", "Día", "Diamante", "Diana", "Diario", "Dibujo", "Diente", "Dinero", "Dinosaurio", 
  "Dios", "Director", "Disco", "Disfraz", "División", "Doctor", "Documento", "Don", "Dragón", "Duende", 
  "Edificio", "Egipto", "Elefante", "Embajada", "Emperador", "Enano", "Energía", "Enfermedad", "Enfermera", "Enlace", 
  "Ensalada", "Equipo", "Escalera", "Escoba", "Escorpión", "Escuela", "Escultura", "Esmeralda", "Espacio", "Espada", 
  "Espejo", "Espía", "Esqueleto", "Estación", "Estadio", "Estado", "Estrella", "Estudiante", "Estudio", "Estufa", 
  "Etiqueta", "Euro", "Europa", "Examen", "Fábrica", "Falda", "Familia", "Fantasma", "Farmacia", "Faro", 
  "Festival", "Ficha", "Fiesta", "Figura", "Fila", "Filosofía", "Física", "Flauta", "Flecha", "Flor", 
  "Fondo", "Forma", "Fórmula", "Fotografía", "Frente", "Fruta", "Fuego", "Fuente", "Fuerza", "Furgoneta", 
  "Galaxia", "Gancho", "Gasolina", "Gato", "Genética", "Genio", "Geografía", "Gigante", "Globo", "Golpe", 
  "Goma", "Gota", "Grado", "Granada", "Grano", "Grecia", "Grifo", "Guante", "Guardia", "Guerra", 
  "Guitarra", "Gusano", "Hada", "Hamburguesa", "Hardware", "Helado", "Helicóptero", "Hermano", "Héroe", "Hielo", 
  "Hierba", "Hierro", "Hijo", "Himalaya", "Historia", "Hoguera", "Hoja", "Hollywood", "Homicidio", "Hospital", 
  "Hotel", "Hueso", "Huevo", "Humo", "Humor", "Idioma", "Iglesia", "Imagen", "Imán", "Incendio", 
  "India", "Indice", "Ingeniero", "Inglaterra", "Insecto", "Internet", "Invierno", "Isla", "Jardín", "Jefe", 
  "Jeringuilla", "Jirafa", "Juego", "Júpiter", "Juzgado", "Kiwi", "Laboratorio", "Ladrón", "Lago", "Lágrima", 
  "Lámpara", "Lana", "Lanza", "Lapa", "Lápiz", "Láser", "Lata", "Leche", "Lectura", "Lengua", 
  "León", "Leyenda", "Libra", "Libro", "Lima", "Limón", "Limusina", "Línea", "Líquido", "Lírico", 
  "Lista", "Llama", "Llave", "Locomotora", "Londres", "Loquera", "Loro", "Lucha", "Luna", "Luz", 
  "Maestro", "Magia", "Mano", "Manta", "Manzana", "Mapa", "Máquina", "Mar", "Marcha", "Marco", 
  "Marfil", "Mariposa", "Masa", "Matemáticas", "Mazo", "Mecánico", "Medicina", "Médico", "Mensaje", "Mesa", 
  "Metal", "Meteorito", "Metro", "México", "Microscopio", "Miel", "Milagro", "Millonario", "Mina", "Minuto", 
  "Misil", "Misterio", "Mochila", "Modelo", "Moneda", "Mono", "Montaña", "Motor", "Muelle", "Muerte", 
  "Muñeca", "Muro", "Museo", "Música", "Naranja", "Naturaleza", "Nave", "Navidad", "Negocio", "Nieve", 
  "Nilo", "Ninja", "Niño", "Noche", "Nota", "Noticia", "Novela", "Nube", "Nudo", "Nuez", 
  "Obra", "Océano", "Ojo", "Ola", "Olimpiadas", "Operación", "Órgano", "Orquesta", "Oso", "Otoño", 
  "Pájaro", "Pala", "Palabra", "Palacio", "Palma", "Pan", "Pantalla", "Pantalón", "Papel", "Paquete", 
  "Paracaídas", "Paraíso", "Pared", "Parque", "Pasado", "Pasaporte", "Pase", "Pasta", "Pastel", "Pavo", 
  "Pelo", "Pelota", "Península", "Pensamiento", "Pera", "Perfume", "Periódico", "Perro", "Pesca", "Pez", 
  "Piano", "Piedra", "Pila", "Piloto", "Pincho", "Pingüino", "Pinta", "Pintura", "Piña", "Píramide", 
  "Pirata", "Pis", "Piscina", "Pista", "Pistola", "Placa", "Planeta", "Plano", "Planta", "Plástico", 
  "Plátano", "Playa", "Plomo", "Pluma", "Poema", "Poesía", "Policía", "Pollo", "Polvo", "Portada", 
  "Portero", "Pozo", "Prensa", "Primavera", "Princesa", "Prisión", "Prismáticos", "Profesor", "Programa", "Puente", 
  "Puerta", "Puerto", "Pulpo", "Pulso", "Punta", "Punto", "Queso", "Química", "Radio", "Raíz", 
  "Rascacielos", "Ratón", "Rayo", "Refugio", "Regla", "Reina", "Reloj", "República", "Reserva", "Restaurante", 
  "Revista", "Revolución", "Rey", "Río", "Ritmo", "Robot", "Roca", "Roma", "Ronda", "Ropa", 
  "Rosa", "Ruido", "Ruleta", "Ruta", "Sabiduría", "Sable", "Saco", "Sáhara", "Sal", "Salsa", 
  "Salud", "Sangre", "Satélite", "Saturno", "Secreto", "Seguro", "Sello", "Semana", "Semilla", "Sentido", 
  "Señal", "Serpiente", "Sierra", "Signo", "Silencio", "Silla", "Sillón", "Símbolo", "Sirena", "Sistema", 
  "Sobre", "Sofá", "Software", "Sol", "Soldado", "Sombra", "Sombrero", "Sonido", "Sopa", "Suela", 
  "Suelo", "Sueño", "Suerte", "Superhéroe", "Supermercado", "Sur", "Tabla", "Tableta", "Taco", "Tacto", 
  "Talón", "Tambor", "Tanque", "Tapa", "Tapiz", "Tarde", "Taza", "Teatro", "Techo", "Teclado", 
  "Tela", "Teléfono", "Telescopio", "Televisión", "Templo", "Temporada", "Tenedor", "Teoría", "Tesoro", "Testigo", 
  "Tiempo", "Tienda", "Tierra", "Tigre", "Tijeras", "Tinta", "Tío", "Tokio", "Tornillo", "Toro", 
  "Torre", "Tortuga", "Trabajo", "Tragedia", "Traje", "Trama", "Transporte", "Tren", "Trenza", "Triángulo", 
  "Triunfo", "Trompa", "Trompeta", "Trono", "Trueno", "Tubo", "Tuerca", "Tulipán", "Unicornio", "Universidad", 
  "Universo", "Uva", "Vaca", "Vacaciones", "Vado", "Valle", "Vampiro", "Vehículo", "Vela", "Veneno", 
  "Ventana", "Venus", "Verano", "Verdad", "Vestido", "Viaje", "Víctima", "Vida", "Vidrio", "Viento", 
  "Vino", "Violeta", "Violín", "Visión", "Vitamina", "Volcán", "Voz", "Vuelo", "Vuelta", "Washington", 
  "Zanahoria", "Zapato", "Zorro"
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

## Creado por

Fabián Álvarez: https://github.com/FabianAlv

Katherine Hernández: https://github.com/hernandezk19

# juego-laberinto

El problema a resolver en este proyecto es crear una aplicación web que permita implementar el juego de mesa “Laberinto”, de la compañía Ravensburger (Link: https://www.ravensburger.org/es/productos/juegos/juegos-de-familia/laberinto-26324/index.html), de una forma interactiva para los usuarios, y que sea más portable o accesible a través de un navegador web. El proyecto equivale al 50% de la nota del curso: Desarrollo de Aplicaciones para Internet y se va a realizar en parejas, mediante la supervisión del profesor. Esta aplicación es un desarrollo nuevo, el cual se llevará a cabo mediante metodologías ágiles. Al juego de mesa original se le harán algunas modificaciones a la hora de crear el sitio web. Entre los cambios propuestos están:

- Las cartas de los jugadores tienen palabras en inglés, las cuales van a ser representadas por las imágenes que van a tener las piezas del tablero. Las cartas que aparecerán en el juego van a ser seleccionadas aleatoriamente de una lista de cartas.
- Una pieza “comodín” en el centro del laberinto, que permita al jugador (si este logra llegar a dicha pieza) moverse a cualquier otro sitio del laberinto. Después de que algún jugador obtenga este comodín, durará de dos a cuatro turnos en volver a aparecer
- Agregar piezas en el tablero, con una imagen distintiva que le permitirán al jugador coger una carta (diferente a las que contienen palabras) que puede usar en cualquiera de sus próximos turnos. La carta le permitirá al jugador poder rotar en cualquier dirección una ficha del tablero. Las piezas con la imagen distintiva van a sustituir algunas de las piezas del tablero que no tienen imágenes.
- Cuando el jugador encuentre su tesoro, la ficha que le va a tocar después siempre va a ser una de las más lejanas de alcanzar con respecto a su posición actual.

## Contexto

El juego del Laberinto consta de:

- **Un tablero**
- **Un conjunto de piezas de laberinto:** Se colocan sobre el tablero y permiten formar un camino (o laberinto). Además poseen imágenes que se relacionan con las **cartas tesoro**
- **Un conjunto de cartas tesoro:** cada carta tiene una palabra en inglés que se relaciona con una imagen en las piezas del tablero. Estas cartas serán repartidas a los jugadores en partes iguales
- **Fichas o personajes para cada jugador:** permite identificar al jugador durante el juego, y a su vez, permite moverse a lo largo del laberinto
- **Pieza comodín:** permite a los jugadores moverse a cualquier otro sitio del laberinto. Si un jugador toma este comodín, tomará de dos a cuatro turnos en volver a aparecer

El objetivo del juego es relacionar cada **carta tesoro** con su imagen en las piezas del tablero. Para esto el jugador debe moverse a través del laberinto y llegar a la imagen respectiva que se relaciona con la palabra en su carta tesoro,

Al comenzar el juego, el organizador debe elegir el tamaño del tablero, por ejemplo una matriz de 4\*4 o de 10\*10. Las piezas de laberinto se van a colocar de manera aleatoria sobre el tablero. De estas piezas va a sobrar una, la cual va a servir para ir modificando el camino en el laberinto. El jugador que empieza, debe colocar esta ficha dentro del tablero, ingresandola por uno de los extremos permitidos (indicados por una flecha). El jugador colocará esta ficha a su conveniencia, de manera que le permita ir formando un camino hacia el lugar donde desea llegar. La ficha en el extremo opuesto se saldrá del tablero y le tocará al siguiente jugador colocarla, y así sucesivamente.

Las cartas tesoro de cada jugador, se van a colocar en un mazo boca abajo y el jugador debe elegir la primera carta del mazo, la cual va a ser su tesoro a encontrar. Esto significa que el jugador tiene en su carta una palabra en inglés y debe llegar hasta su respectiva imagen en el tablero.

Cuando el jugador logre llegar hasta la imagen correspondiente en el tablero, podrá elegir la siguiente carta en el mazo. Dicha carta será la imagen más lejana con respecto a su posición actual. El jugador que logre encontrar todos sus tesoros primero, es el ganador.

Las reglas del juego original se encuentran en el siguiente link: https://www.ravensburger.com/spielanleitungen/ecm/Spielanleitungen/Laberinto.pdf

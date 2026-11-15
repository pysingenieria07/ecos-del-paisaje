/* Contenido del recorrido guiado. Cada capítulo es una carpeta; cada idea, una pantalla.
   q: pregunta de comprensión · r: índice de la opción correcta · porque: explicación que aparece al responder */
window.RECORRIDO = {
  capitulos: [
    {
      id: 'lugar', n: '01', titulo: 'Leer el lugar', portada: 'esq-lote-manzanas.jpg',
      ideas: [
        {
          id: 'lugar-1', titulo: 'Un borde bajo presión', img: 'esq-lote-manzanas.jpg',
          alt: 'Mapa del lote entre Campo Santo y el Ecoparque Las Tinajas con las 17 manzanas analizadas',
          texto: 'El proyecto está en el borde urbano-rural de Villatina, en la Comuna 8 de Medellín. Los asentamientos informales suben por la ladera sobre zonas con amenaza de deslizamientos y de crecientes de las quebradas.',
          ejemplo: 'Al lado del lote está Campo Santo, que recuerda la tragedia de 1987.',
          mas: 'El lote queda entre Campo Santo, el Ecoparque Las Tinajas y el Cinturón Verde. Las quebradas que lo afectan son La Castro, San Antonio y La Gallinaza.',
          q: '¿Qué está presionando este borde?', ops: ['La expansión informal sobre zonas de amenaza', 'El exceso de equipamientos', 'El tráfico de la vía principal'], r: 0,
          porque: 'La ocupación informal sube por la ladera, justo donde el terreno es más inestable.'
        },
        {
          id: 'lugar-2', titulo: 'El predio', img: 'esq-contexto-mapas.jpg',
          alt: 'Mapas del contexto y del predio con Campo Santo, el ecoparque y la estación del metro',
          texto: 'El lote mide 12.889 m². La norma lo reserva para equipamientos, espacio público y áreas ambientales. Por eso no lo vimos como un terreno vacío, sino como una pieza que puede coser esos sistemas.',
          ejemplo: 'Está a 8–10 minutos a pie de la estación Las Torres y a 5–7 del Ecoparque Las Tinajas.',
          mas: 'El polígono se llama SE-API-05: un Área para la Preservación de Infraestructuras y del Sistema Público y Colectivo del corregimiento de Santa Elena.',
          q: '¿Para qué reserva la norma este lote?', ops: ['Vivienda en altura', 'Equipamientos, espacio público y áreas ambientales', 'Industria liviana'], r: 1,
          porque: 'Es un suelo pensado para lo público y lo ambiental, no para vivienda ni industria.'
        },
        {
          id: 'lugar-3', titulo: 'Replantear la norma', img: 'norma-vs-borde.jpg',
          alt: 'Esquema comparativo: con la norma literal el borde queda vacío; con el borde con peso, el equipamiento marca el límite',
          texto: 'La norma supone que construir poco es proteger más. Pero un borde protegido solo en el papel queda sin dueño y se invade. Propusimos concentrar la ocupación en la franja estable y dejar verde el resto de la ladera.',
          ejemplo: 'A eso lo llamamos «el borde con peso»: el edificio marca un límite físico y continuo.',
          mas: 'La norma permite ocupar máximo el 3 % en suelo de protección y el 5 % en suelo rural. Propusimos un parágrafo para el Art. 126 del Decreto 409 que permite superar ese índice si la ocupación se concentra en terreno estable.',
          q: '¿Qué propone «el borde con peso»?', ops: ['No construir nada en el lote', 'Ocupar toda la ladera con edificios bajos', 'Concentrar lo construido en la franja estable y dejar la ladera verde'], r: 2,
          porque: 'El equipamiento ocupa solo la franja estable y funciona como límite; ladera arriba quedan huertas, senderos y miradores.'
        }
      ]
    },
    {
      id: 'comunidad', n: '02', titulo: 'Conocer a la gente', portada: 'esq-organigrama.jpg',
      ideas: [
        {
          id: 'comunidad-1', titulo: 'Una comunidad joven',
          barras: { titulo: 'Personas por edad', filas: [['0–19 años', 1230], ['20–39 años', 1276], ['40–69 años', 845]] },
          texto: 'Contamos manzana por manzana. Unas 3.351 personas usarían el equipamiento, y la mayoría son niños, jóvenes y adultos jóvenes.',
          ejemplo: 'Tres de cada cuatro tienen menos de 40 años.',
          mas: 'Analizamos las 17 manzanas vecinas al lote. La proporción por sexo es 48 % mujeres y 51 % hombres.',
          q: '¿Cuántas personas usarían el equipamiento?', ops: ['845', '3.351', '12.889'], r: 1,
          porque: '3.351 es la suma de los tres grupos de edad. 12.889 son los metros cuadrados del lote.'
        },
        {
          id: 'comunidad-2', titulo: 'Pensar en cuarenta años', img: 'render-interior.jpg',
          alt: 'Render interior: personas entre huertas bajo una estructura de madera',
          texto: 'Esa población joven va a envejecer en el mismo barrio. El proyecto no podía pensarse solo para hoy: tenía que servir a varias generaciones al mismo tiempo.',
          ejemplo: 'Por eso es un equipamiento ambiental e intergeneracional: encuentro, aprendizaje, bienestar y cuidado.',
          q: '¿Por qué el equipamiento es intergeneracional?', ops: ['Porque la población joven de hoy envejecerá en el barrio', 'Porque la norma lo exige', 'Porque hoy casi todos son adultos mayores'], r: 0,
          porque: 'La lectura demográfica muestra hacia dónde va el barrio: los jóvenes de hoy serán los mayores de mañana.'
        },
        {
          id: 'comunidad-3', titulo: 'Cuatro ejes', img: 'esq-organigrama.jpg',
          alt: 'Organigrama de burbujas con la memoria al centro y los espacios del programa alrededor',
          texto: 'De los datos salieron cuatro ejes que ordenan el programa: memoria, creación, ambiente con envejecimiento activo, y formación. La memoria va al centro.',
          ejemplo: 'Memoria y creación ocupan el 30 % cada una; ambiente el 25 % y formación el 15 %.',
          asociar: {
            pregunta: 'Une cada eje con uno de sus espacios.',
            pares: [['Memoria', 'Archivo comunitario'], ['Ambiente', 'Vivero y huerta'], ['Creación', 'Laboratorio audiovisual'], ['Formación', 'Aula digital']]
          }
        }
      ]
    },
    {
      id: 'clima', n: '03', titulo: 'Entender el clima', portada: 'esq-bioclimatico.jpg',
      ideas: [
        {
          id: 'clima-1', titulo: 'El año es plano; el día no', img: 'esq-dia-24h.jpg',
          alt: 'Gráfico circular de un día típico: 42 % de las horas frías, 40 % en confort y 18 % cálidas',
          texto: 'En Villatina la temperatura casi no cambia de un mes a otro: apenas 1,3 °C. En cambio, en un mismo día cambia unos 11 °C entre la madrugada y el mediodía.',
          ejemplo: 'Un día típico: 42 % de las horas frías, 40 % en confort y 18 % cálidas.',
          mas: 'Corregimos los datos de la estación Olaya Herrera a la altura del lote, unos 1.850 msnm. Allí la temperatura media es de 19,4 °C.',
          q: '¿Dónde está el cambio grande de temperatura?', ops: ['Entre enero y julio', 'Entre la madrugada y el mediodía', 'Entre un año y otro'], r: 1,
          porque: 'El clima es estable todo el año, pero cada día recorre unos 11 °C.'
        },
        {
          id: 'clima-2', titulo: 'Guardar calor', img: 'esq-bioclimatico.jpg',
          alt: 'Esquema bioclimático: sol, brisa de tarde, aire frío nocturno, muro de contención como masa térmica y pilotes',
          texto: 'Las horas frías son casi todas de noche. Esa lectura cambió el proyecto: el edificio tiene que guardar el calor del día más que expulsarlo.',
          ejemplo: 'El muro de contención y la losa guardan calor de día y lo devuelven de noche.',
          mas: 'El 43 % de las horas está por debajo de 18 °C. En el horario de uso, de 8 a 18 h, dos de cada tres horas ya están en confort sin máquinas.',
          q: '¿Qué elemento guarda el calor del día?', ops: ['Las ventanas', 'La malla de sombra', 'El muro de contención y la losa'], r: 2,
          porque: 'Son los elementos con más masa: se calientan despacio y sueltan el calor en la noche.'
        },
        {
          id: 'clima-3', titulo: 'El agua baja por la ladera', img: 'esq-agua-ladera.jpg',
          alt: 'Recorrido del agua en el lote: escorrentía, cubierta que recoge, tanque de reúso y zanjas de infiltración',
          texto: 'Llueve mucho: 2.240 mm al año, repartidos en 173 días. Aquí el agua no es solo un dato del clima; es lo que define cómo se toca la ladera.',
          ejemplo: 'La cubierta recoge, el tanque guarda y las zanjas infiltran antes de llegar a la quebrada.',
          mas: 'Hay dos temporadas de lluvia: de marzo a mayo y de octubre a noviembre. El edificio se levanta sobre pilotes, con piso ventilado y sin muros enterrados sin drenaje.',
          q: '¿Qué hace el proyecto con la lluvia?', ops: ['La recoge, la guarda y la infiltra', 'La lleva directo a la quebrada', 'La deja correr por la ladera'], r: 0,
          porque: 'Cada paso frena el agua antes de que llegue a la quebrada, y parte se reutiliza en las huertas.'
        }
      ]
    },
    {
      id: 'idea', n: '04', titulo: 'Encontrar la idea', portada: 'esq-ideas.jpg',
      ideas: [
        {
          id: 'idea-1', titulo: 'El paisaje es la estructura', img: 'esq-espacio-publico.jpg',
          alt: 'Tipos de espacio público: parque recreativo, zonas recreativas, huertas urbanas y jardín',
          texto: 'Las huertas y las áreas verdes no quedan afuera. Entran poco a poco al edificio y forman patios, espacios de transición y lugares para quedarse.',
          ejemplo: 'La frase que guía el proyecto: «el paisaje como infraestructura social y espacial».',
          q: '¿Dónde quedan las huertas en este proyecto?', ops: ['En un lote aparte', 'Dentro del edificio, formando patios', 'Solo en la cubierta'], r: 1,
          porque: 'La arquitectura se organiza alrededor de patios, jardines y huertas.'
        },
        {
          id: 'idea-2', titulo: 'Todo gira alrededor del agua', img: 'render-espejo.jpg',
          alt: 'Render exterior: espejo de agua circular con lotos, gradas y la fachada curva de vidrio y madera',
          texto: 'Los volúmenes se curvan alrededor de un espejo de agua. Es el centro del proyecto y representa la memoria del barrio.',
          ejemplo: 'Desde las gradas, la biblioteca y la plaza siempre se ve el agua.',
          q: '¿Qué hay en el centro del conjunto?', ops: ['La cancha', 'El parqueadero', 'El espejo de agua'], r: 2,
          porque: 'El espejo de agua-memoria es el punto alrededor del cual se curvan los edificios.'
        },
        {
          id: 'idea-3', titulo: 'Vegetación por capas', img: 'estratos.webp',
          alt: 'Diagrama de estratos vegetales: arbóreo, arbustivo, tapizante y biorretención',
          texto: 'Para proteger la ladera se siembra en cuatro capas: árboles, arbustos, plantas que cubren el suelo y jardines que retienen el agua.',
          ejemplo: 'Cada capa frena la lluvia a una altura distinta antes de que toque el suelo.',
          q: '¿Para qué sirve sembrar en capas?', ops: ['Para proteger la ladera y frenar el agua', 'Para tapar el edificio', 'Para producir madera'], r: 0,
          porque: 'Las capas arbórea, arbustiva, tapizante y de biorretención trabajan juntas contra la erosión.'
        }
      ]
    },
    {
      id: 'programa', n: '05', titulo: 'Armar el programa', portada: 'esq-planta-usos.jpg',
      ideas: [
        {
          id: 'programa-1', titulo: 'Un color por actividad', img: 'esq-planta-usos.jpg',
          alt: 'Planta de usos del conjunto con el recorrido principal y los usos coloreados',
          texto: 'Repartimos los usos en volúmenes que siguen la topografía. Cada color corresponde a un tipo de actividad y se repite igual en todas las plantas y secciones.',
          ejemplo: 'Verde para naturaleza, ocre para talleres, vino para exposición y azul agua para la memoria.',
          q: '¿Para qué sirve la convención de colores?', ops: ['Para decorar los planos', 'Para leer el mismo uso en todas las plantas y secciones', 'Para indicar los materiales'], r: 1,
          porque: 'El color permite reconocer cada actividad sin leer rótulos, en cualquier plano.'
        },
        {
          id: 'programa-2', titulo: 'Cuatro volumetrías', img: 'render-biblioteca.jpg',
          alt: 'Render interior de la biblioteca: estanterías de madera y gradas con personas leyendo',
          texto: 'El programa se reparte en cuatro cuerpos: la biblioteca con la sala de exposiciones; el Jardín Buen Crecer con los talleres; y dos más con comercio, vivero-termas y mirador.',
          ejemplo: 'Los talleres de agricultura, carpintería y artes se conectan directo con las huertas públicas.',
          q: '¿Qué acompaña a los talleres en su volumetría?', ops: ['El mirador', 'El Jardín Buen Crecer', 'La sala de exposiciones'], r: 1,
          porque: 'La volumetría 2 reúne el Jardín Buen Crecer y los talleres.'
        },
        {
          id: 'programa-3', titulo: 'Seis láminas de plantas', img: 'planta-1a.jpg',
          alt: 'Lámina A1, planta arquitectónica: Biblioteca y Jardín Buen Crecer',
          texto: 'Las plantas están dibujadas a escala 1:200 en seis láminas, de la A1 a la A6. Van de la biblioteca a las cubiertas.',
          ejemplo: 'A1 y A2 son la biblioteca; A3 y A4, talleres, cocina y comercio; A5, gradas, mirador, termas y vivero; A6, cubiertas.',
          q: '¿Qué muestra la lámina A6?', ops: ['Las cubiertas', 'La biblioteca', 'Los módulos de comercio'], r: 0,
          porque: 'La última lámina es la planta de cubiertas sobre la topografía.'
        }
      ]
    },
    {
      id: 'recorrido', n: '06', titulo: 'Trazar el recorrido', portada: 'esq-circulacion-iso.jpg',
      ideas: [
        {
          id: 'recorrido-1', titulo: 'La circulación abraza el conjunto', img: 'esq-circulacion-iso.jpg',
          alt: 'Axonometría del conjunto con la circulación marcada en rojo',
          texto: 'El edificio se piensa como una extensión del espacio público. Un recorrido continuo rodea el conjunto y lleva a la gente hacia los espacios públicos.',
          ejemplo: 'Terrazas escalonadas: se recorre todo el proyecto sin grandes subidas.',
          q: '¿Cómo se adapta el recorrido a la pendiente?', ops: ['Con un ascensor central', 'Con terrazas escalonadas', 'Con una sola escalera larga'], r: 1,
          porque: 'Las terrazas reparten la pendiente en tramos cortos y siempre con vista al paisaje.'
        },
        {
          id: 'recorrido-2', titulo: 'Tres accesos', img: 'esq-recorrido-axo.jpg',
          alt: 'Axonometría con el recorrido punteado desde los tres accesos hasta el vivero',
          texto: 'Se entra por tres puntos: el principal, peatonal, desde el barrio; otro peatonal y ciclista desde la parte alta; y un tercero desde la zona deportiva.',
          ejemplo: 'Así el proyecto se conecta con el barrio, con la ladera y con lo que ya existe.',
          q: '¿Por dónde entran quienes llegan en bicicleta?', ops: ['Por el acceso 1, desde la vía principal', 'Por el acceso 2, desde la parte alta', 'Por el acceso 3, desde la zona deportiva'], r: 1,
          porque: 'El acceso 2 es peatonal y ciclista, y llega desde la parte alta del terreno.'
        },
        {
          id: 'recorrido-3', titulo: 'De la actividad a la calma', img: 'render-plaza.jpg',
          alt: 'Render exterior: plaza escalonada con jardineras de ladrillo y una pérgola curva de madera',
          texto: 'El recorrido tiene un orden: empieza en lo más activo y termina en lo más tranquilo. De los accesos y el comercio pasa a los talleres, luego a la cultura y la memoria, y al final al paisaje.',
          ejemplo: 'Accesos → comercio → zona deportiva → talleres → cultura y memoria → espejo de agua → huertas → vivero y mirador.',
          q: '¿Dónde termina el recorrido?', ops: ['En el comercio', 'En la zona deportiva', 'En el vivero y el mirador'], r: 2,
          porque: 'La secuencia va de la actividad a la contemplación: lo último es el paisaje.'
        }
      ]
    },
    {
      id: 'proyecto', n: '07', titulo: 'Construir el proyecto', portada: 'seccion.jpg',
      ideas: [
        {
          id: 'proyecto-1', titulo: 'Niveles que siguen la ladera', img: 'seccion.jpg',
          alt: 'Sección longitudinal y sección transversal del proyecto sobre la ladera',
          texto: 'Las secciones muestran cómo el proyecto sube con el terreno: espacio público abajo, huertas en la mitad, talleres más arriba y, en lo alto, el mirador con comercio.',
          ejemplo: 'Es el mismo orden del recorrido, visto de lado.',
          q: '¿Qué queda en la parte más alta?', ops: ['El mirador con comercio', 'Las huertas', 'El espacio público'], r: 0,
          porque: 'El mirador aprovecha la altura; lo público queda abajo, cerca de la vía.'
        },
        {
          id: 'proyecto-2', titulo: 'Cinco capas del detalle', img: 'esq-detalle.jpg',
          alt: 'Corte fugado de detalle: cubierta en madera, vigas metálicas, muro de contención y pilotes',
          texto: 'De arriba abajo: viguetas de madera en la cubierta, vigas metálicas de amarre, muro de contención, losa de cimentación y pilotes.',
          ejemplo: 'Los pilotes bajan 7 metros hasta suelo firme y dejan el piso ventilado.',
          q: '¿Cuánto bajan los pilotes?', ops: ['3 metros', '7 metros', '12 metros'], r: 1,
          porque: 'Con 7 metros llegan a suelo firme y separan el edificio de la humedad del terreno.'
        },
        {
          id: 'proyecto-3', titulo: 'El conjunto construido', img: 'render-aereo.jpg',
          alt: 'Render aéreo del conjunto: volúmenes de madera alrededor de la plaza y el espejo de agua',
          texto: 'Visto desde arriba se entiende todo junto: los volúmenes rodean la plaza y el espejo de agua, y detrás la ladera sigue verde.',
          ejemplo: 'Mira la imagen con calma: busca el espejo de agua, las gradas y la pérgola.',
          q: '¿Qué pasa con la ladera detrás del edificio?', ops: ['Se llena de vivienda', 'Se pavimenta', 'Queda verde'], r: 2,
          porque: 'Es la idea del borde con peso: lo construido se concentra y la ladera se conserva.'
        }
      ]
    },
    {
      id: 'estructura', n: '08', titulo: 'Resolver la estructura', portada: 'cubiertas-madera.jpg',
      ideas: [
        {
          id: 'estructura-1', titulo: 'Cubierta de casetones', img: 'cubiertas-madera.jpg',
          alt: 'Lámina de cubiertas de madera: plantas de los cuatro paños, sección radial e isométricos',
          texto: 'La cubierta curva de madera es la imagen del proyecto. Se arma con casetones sobre viguetas de madera laminada, apoyadas en vigas y columnas metálicas.',
          ejemplo: 'Son 1.399 m² de cubierta en cuatro paños; cada casetón mide 0,50 × 1,20 m.',
          q: '¿Sobre qué se apoyan los casetones?', ops: ['Sobre muros de ladrillo', 'Sobre viguetas de madera laminada', 'Sobre una losa de concreto'], r: 1,
          porque: 'Las viguetas de glulam cargan los casetones y descansan en la estructura metálica.'
        },
        {
          id: 'estructura-2', titulo: 'Lluvia para las huertas', img: 'glulam-malla.jpg',
          alt: 'Lámina glulam y malla: franja de glulam con claraboyas y domo en malla',
          texto: 'Todas las cubiertas tienen pendiente hacia canales y bajantes. El agua lluvia termina en la huerta.',
          ejemplo: 'Por cada milímetro de lluvia, la cubierta recoge 1.399 litros.',
          q: '¿A dónde va el agua que cae en las cubiertas?', ops: ['A la huerta', 'Al alcantarillado', 'A la vía'], r: 0,
          porque: 'Canales y bajantes la llevan a las huertas, como en el capítulo del clima.'
        },
        {
          id: 'estructura-3', titulo: 'Cuánto cuesta',
          barras: { titulo: 'Parte del presupuesto (%)', filas: [['Cimentación y contención', 36.5], ['Estructura metálica', 24.6], ['Muro cortina y fachada', 9.1], ['Cubierta de casetones', 4.6]], sufijo: ' %' },
          texto: 'El predimensionamiento académico da un valor estimado de $9.516 millones. Lo que más pesa no es lo que se ve.',
          ejemplo: 'Más de un tercio se va en cimentación y contención: es el costo de construir en ladera.',
          mas: 'Precios de octubre de 2026. No incluye pisos, escaleras, instalaciones, carpintería, paisajismo ni diseños.',
          q: '¿Qué parte pesa más en el presupuesto?', ops: ['La cubierta de madera', 'La estructura metálica', 'La cimentación y la contención'], r: 2,
          porque: 'Con 36,5 %, sostener la ladera cuesta más que cualquier otra parte.'
        }
      ]
    }
  ],

  /* Evaluación final: una pregunta por capítulo que relaciona ideas entre sí */
  final: [
    { cap: 'lugar', q: '¿Por qué no basta con prohibir construir en el borde?', ops: ['Porque un borde vacío queda sin dueño y se invade', 'Porque la norma no existe', 'Porque el terreno es plano'], r: 0 },
    { cap: 'comunidad', q: '¿Qué dato demográfico definió el programa?', ops: ['Que casi todos son adultos mayores', 'Que la población es joven y envejecerá en el barrio', 'Que hay más hombres que mujeres'], r: 1 },
    { cap: 'clima', q: 'El muro de contención sostiene la ladera. ¿Qué más hace?', ops: ['Da sombra', 'Recoge la lluvia', 'Guarda calor para la noche'], r: 2 },
    { cap: 'idea', q: '¿Qué significa «el paisaje como infraestructura»?', ops: ['Que huertas y patios organizan el edificio', 'Que el edificio se pinta de verde', 'Que no hay edificio'], r: 0 },
    { cap: 'programa', q: 'Los talleres se conectan directo con…', ops: ['El parqueadero', 'Las huertas públicas', 'El mirador'], r: 1 },
    { cap: 'recorrido', q: '¿En qué orden avanza el recorrido?', ops: ['De la calma a la actividad', 'Sin orden', 'De la actividad a la calma'], r: 2 },
    { cap: 'proyecto', q: '¿Por qué el edificio va sobre pilotes?', ops: ['Para llegar a suelo firme y ventilar el piso', 'Para verse más alto', 'Para ahorrar concreto'], r: 0 },
    { cap: 'estructura', q: 'La lluvia de la cubierta y las huertas: ¿qué relación tienen?', ops: ['Ninguna', 'La cubierta recoge el agua que riega las huertas', 'Las huertas tapan la cubierta'], r: 1 }
  ],

  pausas: {
    observar: [
      { img: 'render-plaza.jpg', alt: 'Render de la plaza de acceso', reto: 'Sin leer nada: cuenta cuántos materiales distintos ves.' },
      { img: 'render-espejo.jpg', alt: 'Render del espejo de agua', reto: 'Sigue con la mirada el borde del agua, de un lado al otro.' },
      { img: 'render-aereo.jpg', alt: 'Render aéreo del conjunto', reto: 'Busca el punto más alto y el más bajo de la imagen.' },
      { img: 'render-aulas-habitadas.jpg', alt: 'Render interior de las aulas', reto: '¿Por dónde entra la luz? Encuentra todas las entradas.' }
    ],
    reflexion: ['¿Qué lugar de tu barrio queda «sin dueño»?', '¿Dónde te gustaría envejecer?', '¿A qué hora del día hace más frío en tu casa?', '¿Qué espacio público usas sin darte cuenta?']
  }
};

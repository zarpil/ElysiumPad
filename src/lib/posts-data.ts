export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage?: string;
  published: boolean;
  readingTime: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const SEED_POSTS: BlogPostData[] = [
  {
    id: 'post-1',
    slug: 'como-crear-launcher-minecraft-personalizado',
    title: 'Cómo crear un Launcher de Minecraft personalizado para tu Servidor (Paso a Paso)',
    excerpt: 'Descubre cómo distribuir tu servidor con mods preconfigurados, Java integrado y conexión directa sin que tus jugadores tengan complicaciones de instalación.',
    category: 'Servidores',
    readingTime: '5 min de lectura',
    views: 1420,
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    published: true,
    content: `Administrar una comunidad de Minecraft con mods suele ser una tarea titánica por un motivo recurrente: la fricción de entrada de los jugadores. Cuando un usuario nuevo intenta entrar a tu servidor y tiene que instalar Java manualmente, descargar un perfil de CurseForge o Modrinth, mover carpetas comprimidas a su directorio de AppData y verificar versiones de librerías, un porcentaje muy alto abandona el proceso antes de conectarse.

En esta guía analizamos la arquitectura técnica de cómo resolver este problema distribuyendo un **cliente preconfigurado autónomo**.

---

### 1. El problema tradicional de la distribución manual de mods

En un ecosistema típico con Fabric o Forge, los fallos más habituales en los usuarios finales son:
- **Incompatibilidad de versión de Java:** Intentar correr Minecraft 1.20 o 1.21 con un Java 8 heredado en su sistema operativo.
- **Desincronización de mods:** El administrador actualiza un mod en el servidor (ej. Simple Voice Chat o Sodium) y los jugadores reciben un error críptico de desconexión por discrepancia de versión.
- **Configuración de memoria RAM incorrecta:** Asignación insuficiente que provoca tirones (*lag spikes*) o congelamientos por recolección de basura de la JVM.

---

### 2. Arquitectura de un Launcher Autónomo

Un launcher optimizado funciona mediante un **manifiesto centralizado en formato JSON**. Cuando el jugador ejecuta el cliente:

1. **Lectura del Manifiesto Remoto:** El ejecutable consulta al servidor web la lista actual de archivos requeridos y sus sumas de verificación SHA-1 / SHA-512.
2. **Descarga Diferencial:** Compara los hashes de la carpeta local del juego con el manifiesto. Si el jugador ya tiene 45 mods y tú agregaste 2 nuevos, únicamente descargará los 2 faltantes en cuestión de segundos.
3. **Aislamiento de Entorno Java:** El cliente detecta si el sistema cuenta con el runtime compatible. Si no existe, despliega un OpenJDK empaquetado de forma totalmente aislada, sin alterar las variables de entorno de Windows.
4. **Lanzamiento con Parámetros JVM Calibrados:** Aplica automáticamente las banderas de optimización recomendadas (como G1GC o ZGC) y la memoria RAM adecuada para tu pack de mods.

---

### 3. Buenas prácticas para mantener tu comunidad activa

- **Mantén la lista de mods optimizada:** Elige mods de optimización probados en el lado cliente (como Sodium, FerriteCore, ModernFix y Lithium).
- **Publica anuncios claros de actualización:** Cuando realices cambios importantes en el mapa o en las mecánicas, notifícalo a través del tablón del launcher para que los jugadores sepan qué novedades encontrarán al iniciar sesión.
- **Soporte para cuentas Microsoft y Offline:** Asegúrate de configurar las directivas de autenticación de acuerdo al público objetivo de tu comunidad.`,
  },
  {
    id: 'post-2',
    slug: 'optimizar-memoria-ram-java-servidores-minecraft',
    title: 'Guía de Optimización de Memoria RAM y Parámetros JVM para Minecraft',
    excerpt: 'Aprende a calcular exactamente cuánta memoria RAM necesita tu paquete de mods y qué banderas JVM usar para eliminar el stuttering y los tirones de FPS.',
    category: 'Rendimiento',
    readingTime: '6 min de lectura',
    views: 980,
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-05T12:00:00.000Z',
    published: true,
    content: `Uno de los mitos más extendidos en la comunidad de Minecraft es la creencia de que *"cuanta más memoria RAM asignes al juego, mejor funcionará"*. En la práctica de la Máquina Virtual de Java (JVM), asignar memoria excesiva suele ser tan perjudicial como asignar memoria insuficiente.

En este artículo explicamos cómo funciona la gestión de memoria en el runtime de Java y cómo configurar las banderas para conseguir la máxima fluidez.

---

### 1. El ciclo del Garbage Collector (GC)

Cuando juegas a Minecraft, el motor del juego crea y destruye constantemente cientos de miles de objetos en la memoria Heap (coordenadas de entidades, fragmentos de chunks, paquetes de red y texturas).

- **Si asignas poca RAM (ej. 1 GB o 2 GB con mods):** La memoria se llena en pocos segundos. El recolector de basura se ve obligado a pausar el juego continuamente (*Stop-the-World pauses*) para liberar espacio, lo que genera congelamientos constantes.
- **Si asignas demasiada RAM (ej. 14 GB a un cliente ligero):** El recolector tarda mucho en activarse porque hay mucho espacio libre disponible. Sin embargo, cuando finalmente se llena, la recolección de un espacio tan masivo causa un congelamiento severo de varios segundos.

---

### 2. Valores de memoria RAM recomendados según el caso

| Tipo de Configuración | RAM Mínima | RAM Recomendada | Modloader sugerido |
|---|---|---|---|
| **Vanilla / Cliente Ligero** (1.20 - 1.21) | 2 GB | 3 GB - 4 GB | Vanilla / Fabric |
| **Packs de Optimización y Calidad de Vida** (< 30 mods) | 3 GB | 4 GB | Fabric |
| **Servidores con Modpacks Medios** (50 a 100 mods) | 4 GB | 6 GB | NeoForge / Fabric |
| **Modpacks Pesados / Industriales / Mágicos** (> 150 mods) | 6 GB | 8 GB | Forge / NeoForge |

---

### 3. Banderas JVM (Java Virtual Machine) recomendadas

Para versiones modernas de Minecraft con Java 17 o Java 21, el recolector G1GC es el estándar más equilibrado. En el panel de configuración de tu launcher, recomendamos estos argumentos base:

\`\`\`bash
-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5
\`\`\`

Estas banderas ayudan a que los ciclos de recolección de memoria se ejecuten en segundo plano sin interrumpir los hilos principales de renderizado de frames.`,
  },
  {
    id: 'post-3',
    slug: 'fabric-vs-forge-vs-neoforge-comparativa-servidores',
    title: 'Fabric vs Forge vs NeoForge: ¿Qué Modloader elegir para tu Comunidad?',
    excerpt: 'Analizamos las diferencias de rendimiento, estabilidad y disponibilidad de mods entre los cargadores más populares para elegir la mejor opción técnica.',
    category: 'Mods',
    readingTime: '7 min de lectura',
    views: 1850,
    createdAt: '2026-03-08T15:30:00.000Z',
    updatedAt: '2026-03-08T15:30:00.000Z',
    published: true,
    content: `La elección del Modloader es la decisión fundacional más importante al planificar una comunidad o servidor de Minecraft. Una mala elección al principio puede acarrear problemas de rendimiento masivos o la imposibilidad de migrar en el futuro.

Actualmente existen tres opciones principales en el ecosistema moderno: **Fabric**, **Forge** y **NeoForge**. A continuación desglosamos sus puntos fuertes y casos de uso.

---

### 1. Fabric: Máximo Rendimiento y Actualizaciones Inmediatas

Fabric nació con una filosofía minimalista: ser un cargador ligero que no modifique excesivamente el código base de Minecraft, dejando la mayor parte de la lógica en librerías modulares (Fabric API).

- **Ventajas:**
  - Consumo de recursos extremadamente bajo y tiempos de arranque ultra rápidos.
  - Disponibilidad casi instantánea para snapshots y nuevas versiones oficiales de Minecraft.
  - Compatibilidad con los mejores mods de rendimiento gráfico del mundo (Sodium, Iris Shaders, Lithium, FerriteCore).
- **Ideal para:** Servidores Survival semivanilla, comunidades de rol ligero, minijuegos y servidores que busquen compatibilidad para jugadores con PCs de gama baja o portátiles.

---

### 2. NeoForge: El Nuevo Estándar de la Comunidad Técnica

NeoForge es la evolución directa del equipo principal de desarrollo que durante años mantuvo Forge, creado con el objetivo de modernizar la base de código, mejorar la API de eventos y garantizar una gobernanza abierta.

- **Ventajas:**
  - Adopción masiva por parte de los creadores de modpacks complejos en versiones 1.20.4, 1.21 y posteriores.
  - API moderna y sistema de compatibilidad robusto con bloques, fluidos y capacidades avanzadas.
  - Mejor rendimiento en el cliente en comparación con las versiones clásicas de Forge.
- **Ideal para:** Comunidades que busquen crear experiencias RPG completas, tecnología (Create y complementos), dimensiones personalizadas y paquetes con más de 100 mods.

---

### 3. Forge Clásico: El Pionero Histórico

Durante más de una década, Minecraft Forge fue el estándar indiscutible. Aunque la comunidad de desarrolladores modernos ha migrado progresivamente hacia NeoForge y Fabric en las versiones más recientes, Forge sigue siendo indispensable para servidores basados en versiones de gran legado histórico como **1.12.2**, **1.16.5** o **1.18.2**.

---

### Veredicto y recomendación para administradores

- Si buscas **fluidez extrema, estabilidad y shaders**: Elige **Fabric**.
- Si buscas **modpacks masivos modernos con Create y cientos de objetos**: Elige **NeoForge**.
- Si administras un **modpack clásico de versiones antiguas**: Mantén **Forge**.`,
  },
  {
    id: 'post-4',
    slug: 'mejores-mods-optimizacion-fabric-minecraft',
    title: 'Los 5 Mods Imprescindibles para Duplicar los FPS en Minecraft con Fabric',
    excerpt: 'Los componentes esenciales de código abierto disponibles en Modrinth para mejorar los fotogramas por segundo y reducir el consumo de memoria en tu cliente.',
    category: 'Mods',
    readingTime: '4 min de lectura',
    views: 2310,
    createdAt: '2026-03-10T18:00:00.000Z',
    updatedAt: '2026-03-10T18:00:00.000Z',
    published: true,
    content: `Optifine fue durante años la herramienta predilecta para mejorar el rendimiento de Minecraft. Sin embargo, en las versiones modernas (1.20 y 1.21), su arquitectura cerrada genera incompatibilidades frecuentes con modloaders actuales.

Hoy en día, el ecosistema de mods de código abierto en Modrinth ofrece alternativas modulares que no solo aumentan los FPS de manera mucho más drástica, sino que corrigen fugas de memoria nativas del motor de renderizado de Minecraft.

---

### 1. Sodium (por JellySquid / CaffeineMC)

Sodium es el estándar de oro absoluto en renderizado. Reescribe el pipeline gráfico de Minecraft para aprovechar de forma nativa las capacidades modernas de tu tarjeta gráfica (OpenGL moderno y multithreading).
- **Impacto típico:** Entre un 100% y un 300% de incremento en FPS frente a Vanilla.
- **Beneficio adicional:** Renderizado suave de chunks y eliminación del tartamudeo al explorar el mundo a alta velocidad.

---

### 2. Lithium (por JellySquid / CaffeineMC)

A diferencia de Sodium (que optimiza el renderizado del cliente), Lithium optimiza la física, la inteligencia artificial de los mobs, el cálculo de iluminación y los ticks del mundo sin alterar en absoluto la jugabilidad ni las mecánicas originales.
- Funciona tanto en el cliente local como en servidores dedicados.

---

### 3. FerriteCore (por malte0811)

Minecraft en versiones modernas utiliza una gran cantidad de memoria RAM para almacenar el estado de los bloques (*BlockStates*) y los modelos 3D en memoria.
- **FerriteCore** compacta estas estructuras de datos en la memoria JVM.
- **Resultado:** Reduce el uso de memoria RAM del juego en hasta un 30% a 50%, permitiendo correr clientes con mods incluso en ordenadores con 4 GB o 8 GB de RAM total.

---

### 4. ModernFix (por Embeddedt)

Corrige fugas de memoria (*memory leaks*), bugs de inicialización de texturas y optimiza el tiempo de carga inicial de la pantalla de Mojang Studios. En paquetes medianos y grandes, puede reducir el tiempo que tarda el juego en abrir a la mitad.

---

### 5. Iris Shaders (por IMS21)

Si tu comunidad desea disfrutar de shaders fotorrealistas con sombras dinámicas e iluminación volumétrica, Iris es el complemento perfecto diseñado para operar en conjunto con Sodium, ofreciendo una tasa de FPS muy superior a los cargadores tradicionales.

---

### Cómo implementarlos en tu Launcher

Desde el panel de control de tu launcher en ElysiumPad, puedes buscar cada uno de estos módulos en la pestaña de **Mods** y añadirlos con un solo clic directamente desde el repositorio oficial de Modrinth. Tus jugadores los recibirán de forma sincronizada y validada.`,
  },
  {
    id: 'post-5',
    slug: 'solucionar-error-internal-exception-java-io-exception-minecraft',
    title: 'Cómo Solucionar el Error "Internal Exception: Java.io.IOException" en Minecraft',
    excerpt: 'Diagnóstico exhaustivo del fallo de conexión más común en servidores de Minecraft: problemas de MTU de red, firewall, time-out de paquetes y cómo repararlo.',
    category: 'Servidores',
    readingTime: '5 min de lectura',
    views: 3120,
    createdAt: '2026-03-11T11:00:00.000Z',
    updatedAt: '2026-03-11T11:00:00.000Z',
    published: true,
    content: `El mensaje de desconexión *"Internal Exception: java.io.IOException: An existing connection was forcibly closed by the remote host"* es uno de los dolores de cabeza más habituales para jugadores y administradores.

A menudo se confunde con una caída del servidor, pero en el 90% de los casos se debe a una **desincronización en el flujo de paquetes de red** o a fragmentación en la capa de transporte TCP.

---

### 1. Causas principales del fallo

1. **Tamaño del paquete superior al MTU (Maximum Transmission Unit):** Cuando un jugador entra a un servidor con muchos mods o entidades concentradas, el servidor envía un paquete inicial masivo. Si el router del usuario fragmenta el paquete y pierde fragmentos, la JVM aborta la conexión.
2. **Mods cliente/servidor incompatibles:** El cliente envía un identificador de paquete que el servidor no reconoce, forzando un cierre inmediato del socket.
3. **Firewalls y software antivirus invasivo:** Ciertos antivirus analizan el tráfico en tiempo real e interceptan los sockets de Java causando un time-out artificial.

---

### 2. Pasos para solucionarlo desde el lado del Jugador

- **Aumentar el tiempo de espera de red con mods:** Mods como **Connectivity** o **Packet Fixer** extienden el límite de tiempo que la JVM espera antes de declarar la desconexión.
- **Restablecer la pila TCP/IP de Windows:**
\`\`\`bash
netsh int ip reset
ipconfig /flushdns
\`\`\`
- **Utilizar DNS fiables:** Configurar los servidores DNS públicos de Cloudflare (1.1.1.1) o Google (8.8.8.8) para evitar resolución errónea de registros SRV del servidor.

---

### 3. Recomendaciones para el Administrador

- Configura un plugin o mod de compresión de red adecuado en \`server.properties\`: establece \`network-compression-threshold=256\` o \`512\`.
- Distribuye el cliente preconfigurado a través de ElysiumPad para garantizar que ningún jugador ingrese con versiones desfasadas de librerías de red.`,
  },
  {
    id: 'post-6',
    slug: 'seguridad-servidores-minecraft-proteccion-ddos-puertos',
    title: 'Guía de Seguridad para Servidores de Minecraft: Protección Anti-DDoS y Puertos',
    excerpt: 'Mejores prácticas para proteger la dirección IP de tu servidor, evitar ataques de denegación de servicio y blindar los puertos RCON y Query.',
    category: 'Servidores',
    readingTime: '6 min de lectura',
    views: 1640,
    createdAt: '2026-03-12T14:20:00.000Z',
    updatedAt: '2026-03-12T14:20:00.000Z',
    published: true,
    content: `Abrir un servidor de Minecraft al público sin las medidas de seguridad adecuadas expone la infraestructura a ataques de saturación volumétrica (UDP Flood), escaneo de puertos y explotación de contraseñas débiles en puertos administrativos.

A continuación detallamos las medidas técnicas obligatorias para cualquier comunidad que busque estabilidad profesional.

---

### 1. Ocultar la IP real mediante Proxies Reverse (TCP Shields / BungeeCord)

Nunca compartas la dirección IP numérica directa del nodo donde corre tu mundo de Minecraft si este no cuenta con filtrado volumétrico a nivel de centro de datos.
- Utiliza servicios de túnel TCP o una red proxy intermedia (Velocity o Waterfall) con mitigación DDoS dedicada.
- Configura el cortafuegos de tu nodo de juego (\`iptables\` o \`ufw\` en Linux) para que **únicamente acepte conexiones provenientes de la IP de tu proxy**:
\`\`\`bash
sudo ufw allow from IP_DEL_PROXY to any port 25565 proto tcp
sudo ufw deny 25565/tcp
\`\`\`

---

### 2. Blindaje del protocolo RCON

El puerto RCON permite enviar comandos de consola remota al servidor. Si está habilitado con contraseñas débiles o por defecto:
- Cambia siempre el puerto predeterminado (no uses 25575).
- Usa contraseñas de al menos 24 caracteres aleatorios.
- Bloquea el acceso externo a RCON permitiendo exclusivamente \`localhost\` (127.0.0.1) si utilizas paneles web locales.

---

### 3. Rate Limiting de conexiones nuevas

Para mitigar bots de spam que intentan colapsar el hilo principal de autenticación conectándose cientos de veces por segundo, instala plugins o mods de antibot basados en reputación de IP o filtrado de geolocalización.`,
  },
  {
    id: 'post-7',
    slug: 'configurar-simple-voice-chat-minecraft-guia',
    title: 'Cómo Configurar Simple Voice Chat: Chat de Voz por Proximidad en Servidores',
    excerpt: 'Aprende a abrir el puerto UDP necesario, ajustar los códecs de audio Opus y sincronizar el cliente para que tus jugadores hablen en tiempo real.',
    category: 'Mods',
    readingTime: '5 min de lectura',
    views: 2890,
    createdAt: '2026-03-13T16:00:00.000Z',
    updatedAt: '2026-03-13T16:00:00.000Z',
    published: true,
    content: `El chat de voz posicional se ha convertido en una característica imprescindible para cualquier servidor moderno de supervivencia, rol (RP) o eventos comunitarios. **Simple Voice Chat** es el estándar de la industria gracias a su soporte nativo para Fabric, Forge, NeoForge, Paper y Purpur.

Sin embargo, a menudo los administradores cometen errores al configurar el puerto UDP de comunicación de voz.

---

### 1. Comprender la diferencia entre TCP y UDP

- El juego de Minecraft funciona principalmente mediante **TCP** (puerto predeterminado 25565).
- La voz en tiempo real requiere **UDP** (baja latencia, sin confirmación de paquetes para evitar retrasos en el audio).
- Si solo abres el puerto TCP en tu hosting o router, el jugador entrará al mundo pero el icono del micrófono aparecerá tachado en rojo con el error *"No conectado"*.

---

### 2. Configuración paso a paso en el Servidor

1. Accede a la carpeta \`config/voicechat/voicechat-server.properties\`.
2. Localiza la línea \`port=24454\`.
3. Si estás en un VPS o servidor dedicado, abre el puerto en el firewall:
\`\`\`bash
sudo ufw allow 24454/udp
\`\`\`
4. Si utilizas un hosting compartido con puertos limitados, cambia \`24454\` por el puerto secundario asignado por tu proveedor y reinicia el servidor.

---

### 3. Distribución simplificada en el Launcher

Uno de los problemas de Simple Voice Chat es que si el cliente no tiene exactamente la versión de protocolo compatible con el servidor, no se establecerá la conexión de audio.
Con ElysiumPad, basta con fijar la versión exacta en tu panel de mods: cuando el usuario inicie su launcher, tendrá el mod de voz instalado y listo para presionar la tecla de hablar (Push-to-Talk) sin configuraciones adicionales.`,
  },
  {
    id: 'post-8',
    slug: 'optimizar-distancia-renderizado-simulacion-minecraft',
    title: 'Distancia de Renderizado vs Simulación: Cómo Ganar el Doble de Rendimiento',
    excerpt: 'Diferencias clave entre View Distance y Simulation Distance en Minecraft moderno para mantener 20 TPS estables en tu servidor.',
    category: 'Rendimiento',
    readingTime: '4 min de lectura',
    views: 2150,
    createdAt: '2026-03-14T09:30:00.000Z',
    updatedAt: '2026-03-14T09:30:00.000Z',
    published: true,
    content: `Desde la actualización 1.18 (Caves & Cliffs), el mundo de Minecraft aumentó drásticamente su altura y profundidad (de Y -64 a Y 320), lo que supuso un **50% más de bloques por cada chunk cargado**.

Para equilibrar esto, Mojang dividió la distancia en dos parámetros independientes: **View Distance** y **Simulation Distance**.

---

### 1. ¿Qué hace cada ajuste?

- **View Distance (Distancia visual):** Determina qué tan lejos puede ver el jugador. El servidor envía los paquetes gráficos del terreno, pero las entidades alejadas no consumen ciclos de cálculo de IA.
- **Simulation Distance (Distancia de simulación):** Es el radio real en el que ocurren los eventos lógicos: crecimiento de cultivos, movimiento de aldeanos, activación de redstone y desove de mobs.

---

### 2. Configuración óptima para Servidores Comunitarios

En \`server.properties\`:
- \`simulation-distance=6\` o \`8\`: Más que suficiente para que las granjas y la redstone funcionen de manera natural sin asfixiar la CPU del servidor.
- \`view-distance=10\` a \`12\`: Permite una vista panorámica amplia del paisaje.

---

### 3. Mods complementarios de visualización infinita

Si deseas que los jugadores aprecien cordilleras y construcciones a distancias increíbles (32 a 64 chunks) sin sobrecargar el servidor ni el cliente:
- Añade el mod **Distant Horizons** o **Bobby**.
- Estos mods almacenan en caché el terreno previamente visitado y generan niveles de detalle (LOD) simplificados, permitiendo vistas impresionantes a más de 100 FPS.`,
  },
];


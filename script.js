// ----------------------------------------------------------------------------
// Variabili globali
// ----------------------------------------------------------------------------
let scene, camera, renderer, currentExample; // Elementi principali della scena 3D
let fps = 0, lastFrame = Date.now();        // Contatori per FPS e tempo
let animationId = null;                     // ID per l'animazione
let isDragging = false;                     // Stato del trascinamento del mouse
let previousMousePosition = { x: 0, y: 0 }; // Posizione precedente del mouse

// ----------------------------------------------------------------------------
// Inizializzazione della scena
// ----------------------------------------------------------------------------
function init() {
    // Creazione del renderer WebGL (Video di Lomarco: "Three.js Basic Scene Tutorial")
    renderer = new THREE.WebGLRenderer({
        antialias: false, // Disabilita antialiasing per migliorare le prestazioni
        powerPreference: document.getElementById('lowPowerMode').checked ? "low-power" : "high-performance"
    });

    // Imposta le dimensioni del renderer in base alla finestra
    renderer.setSize(
        document.getElementById('content').offsetWidth, 
        document.getElementById('content').offsetHeight
    );

    // Aggiunge il canvas al DOM (Video di Lomarco: "Alla Scoperta del Terzo Asse")
    document.getElementById('content').appendChild(renderer.domElement);

    // Creazione della camera prospettica (Video di Lomarco: "Three.js Basic Scene Tutorial")
    camera = new THREE.PerspectiveCamera(
        75, // Campo visivo
        document.getElementById('content').offsetWidth / document.getElementById('content').offsetHeight, // Aspect ratio
        0.1, // Piano near
        1000 // Piano far
    );
    camera.position.z = 5; // Posiziona la camera lungo l'asse Z

    // Aggiungi event listener per il trascinamento del mouse (Video di Lomarco: "Interazione con l'Utente in Three.js")
    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });

    // Gestione del ridimensionamento della finestra (Video di Lomarco: "Ottimizzazione delle Prestazioni in Three.js")
    window.addEventListener('resize', () => {
        const content = document.getElementById('content');
        camera.aspect = content.offsetWidth / content.offsetHeight; // Aggiorna aspect ratio
        camera.updateProjectionMatrix(); // Aggiorna la proiezione della camera
        renderer.setSize(content.offsetWidth, content.offsetHeight); // Ridimensiona il renderer
    });

    // Aggiornamento degli indicatori di performance (Video di Lomarco: "Ottimizzazione delle Prestazioni in Three.js")
    setInterval(() => {
        document.getElementById('fps').textContent = `🔄 FPS: ${fps}`;
        document.getElementById('memUsage').textContent = `💾 RAM: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`;
        fps = 0; // Resetta il contatore FPS

        // Simulazione casuale dell'avviso di temperatura
        if(Math.random() < 0.1) {
            document.getElementById('tempWarning').style.display = 'block';
        } else {
            document.getElementById('tempWarning').style.display = 'none';
        }
    }, 1000);
}

// ----------------------------------------------------------------------------
// Definizione delle scene disponibili
// ----------------------------------------------------------------------------
const examples = {
    // Scena Wireframe (Video di Lomarco: "Three.js Basic Scene Tutorial")
    wireframe: () => {
        const geometry = new THREE.IcosahedronGeometry(2, 0); // Geometria icosaedro
        const material = new THREE.MeshBasicMaterial({
            wireframe: true, // Modalità wireframe
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5), // Colore casuale
            transparent: true,
            opacity: 0.7
        });
        currentExample = new THREE.Mesh(geometry, material); // Crea la mesh
        scene.add(currentExample); // Aggiungi alla scena
    },

    // Scena Low-Poly (Video di Lomarco: "Alla Scoperta del Terzo Asse")
    lowpoly: () => {
        const colors = [0xF5A623, 0x7ED321, 0x4A90E2, 0x9013FE]; // Palette di colori
        const geometry = new THREE.DodecahedronGeometry(2, 0); // Geometria dodecaedro
        const material = new THREE.MeshPhongMaterial({
            color: colors[Math.floor(Math.random() * colors.length)], // Colore casuale
            flatShading: true, // Ombreggiatura piatta
            shininess: 0 // Superficie opaca
        });
        
        currentExample = new THREE.Mesh(geometry, material); // Crea la mesh
        
        // Configurazione delle luci (Video di Lomarco: "Alla Scoperta del Terzo Asse")
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(0, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040)); // Luce ambiente
        
        scene.add(currentExample); // Aggiungi alla scena
    },

    // Scena Pattern (Video di Lomarco: "Animazioni 3D con Three.js")
    pattern: () => {
        currentExample = new THREE.Group(); // Gruppo per contenere gli oggetti
        const geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16); // Geometria toroide
        
        // Crea 24 istanze disposte circolarmente
        for(let i = 0; i < 24; i++) {
            const material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: new THREE.Color().setHSL((i * 0.1) % 1, 0.7, 0.5) // Colore progressivo
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = Math.cos(i * 0.4) * 4; // Posiziona lungo un cerchio
            mesh.position.y = Math.sin(i * 0.4) * 4;
            mesh.rotation.z = i * 0.3; // Rotazione progressiva
            currentExample.add(mesh); // Aggiungi al gruppo
        }
        scene.add(currentExample); // Aggiungi il gruppo alla scena
    }
};

// ----------------------------------------------------------------------------
// Funzioni di utilità
// ----------------------------------------------------------------------------
function cleanScene() {
    if(scene) {
        // Rimuove tutte le risorse dalla GPU (Video di Lomarco: "Ottimizzazione delle Prestazioni in Three.js")
        scene.traverse(obj => {
            if(obj.isMesh) {
                obj.geometry.dispose(); // Libera la geometria
                obj.material.dispose(); // Libera il materiale
            }
        });
        scene = null; // Resetta la scena
    }
    
    if(animationId) {
        cancelAnimationFrame(animationId); // Ferma l'animazione corrente
        animationId = null;
    }
}

function loadExample(type) {
    cleanScene(); // Pulisce la scena precedente
    scene = new THREE.Scene(); // Crea una nuova scena
    examples[type](); // Carica la scena selezionata
    animate(); // Avvia l'animazione
}

// ----------------------------------------------------------------------------
// Animazione principale
// ----------------------------------------------------------------------------
function animate() {
    animationId = requestAnimationFrame(animate); // Richiede il prossimo frame
    
    const time = Date.now() * 0.001; // Tempo in secondi
    
    // Applica rotazione automatica (Video di Lomarco: "Animazioni 3D con Three.js")
    if(currentExample) {
        currentExample.rotation.x = time * 0.3;
        currentExample.rotation.y = time * 0.2;
        currentExample.rotation.z = time * 0.1;
    }

    renderer.render(scene, camera); // Renderizza la scena
    fps++; // Aggiorna il contatore FPS
}

// ----------------------------------------------------------------------------
// Gestione della modalità risparmio energetico
// ----------------------------------------------------------------------------
document.getElementById('lowPowerMode').addEventListener('change', (e) => {
    renderer.setPowerPreference(e.target.checked ? "low-power" : "high-performance");
    
    // Regola la qualità del rendering (Video di Lomarco: "Ottimizzazione delle Prestazioni in Three.js")
    if(e.target.checked) {
        renderer.setPixelRatio(0.8); // Riduce la risoluzione
    } else {
        renderer.setPixelRatio(window.devicePixelRatio);
    }
});

// ----------------------------------------------------------------------------
// Avvio dell'applicazione
// ----------------------------------------------------------------------------
init(); // Inizializza la scena
loadExample('wireframe'); // Carica la scena iniziale
// ----------------------------------------------------------------------------
// Variabili globali
// ----------------------------------------------------------------------------
let scene, camera, renderer, currentExample; // Elementi principali della scena 3D
let fps = 0, lastFrame = Date.now();        // Contatori per FPS e tempo
let animationId = null;                     // ID per l'animazione
let isDragging = false;                     // Stato del trascinamento del mouse
let previousMousePosition = { x: 0, y: 0 }; // Posizione precedente del mouse
let bubbleAnimationId = null;               // ID per l'animazione delle bolle

// ----------------------------------------------------------------------------
// Inizializzazione della scena
// ----------------------------------------------------------------------------
function init() {
    // Creazione del renderer WebGL
    renderer = new THREE.WebGLRenderer({
        antialias: false, // Disabilita antialiasing per migliorare le prestazioni
        powerPreference: document.getElementById('lowPowerMode')?.checked ? "low-power" : "high-performance"
    });

    // Imposta le dimensioni del renderer in base alla finestra
    const content = document.getElementById('content');
    if (content) {
        renderer.setSize(content.offsetWidth, content.offsetHeight);
        content.appendChild(renderer.domElement);
    }

    // Creazione della camera prospettica
    camera = new THREE.PerspectiveCamera(
        75, // Campo visivo
        content ? content.offsetWidth / content.offsetHeight : 1, // Aspect ratio
        0.1, // Piano near
        1000 // Piano far
    );
    camera.position.z = 5; // Posiziona la camera lungo l'asse Z

    // Aggiungi event listener per il trascinamento del mouse
    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });

    // Gestione del ridimensionamento della finestra
    window.addEventListener('resize', () => {
        const content = document.getElementById('content');
        if (content) {
            camera.aspect = content.offsetWidth / content.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(content.offsetWidth, content.offsetHeight);
        }
    });

    // Aggiornamento degli indicatori di performance
    setInterval(() => {
        const fpsElement = document.getElementById('fps');
        const memUsageElement = document.getElementById('memUsage');
        const tempWarningElement = document.getElementById('tempWarning');

        if (fpsElement) fpsElement.textContent = `🔄 FPS: ${fps}`;
        if (memUsageElement) memUsageElement.textContent = `💾 RAM: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`;
        fps = 0; // Resetta il contatore FPS

        if (tempWarningElement) {
            if (Math.random() < 0.1) {
                tempWarningElement.style.display = 'block';
            } else {
                tempWarningElement.style.display = 'none';
            }
        }
    }, 1000);
}

// ----------------------------------------------------------------------------
// Definizione delle scene disponibili
// ----------------------------------------------------------------------------
const examples = {
    // Scena Wireframe
    wireframe: () => {
        const geometry = new THREE.IcosahedronGeometry(2, 0);
        const material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
            transparent: true,
            opacity: 0.7
        });
        currentExample = new THREE.Mesh(geometry, material);
        scene.add(currentExample);
    },

    // Scena Low-Poly
    lowpoly: () => {
        const colors = [0xF5A623, 0x7ED321, 0x4A90E2, 0x9013FE];
        const geometry = new THREE.DodecahedronGeometry(2, 0);
        const material = new THREE.MeshPhongMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            flatShading: true,
            shininess: 0
        });
        
        currentExample = new THREE.Mesh(geometry, material);
        
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(0, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));
        
        scene.add(currentExample);
    },

    // Scena Pattern
    pattern: () => {
        currentExample = new THREE.Group();
        const geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        
        for(let i = 0; i < 24; i++) {
            const material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: new THREE.Color().setHSL((i * 0.1) % 1, 0.7, 0.5)
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = Math.cos(i * 0.4) * 4;
            mesh.position.y = Math.sin(i * 0.4) * 4;
            mesh.rotation.z = i * 0.3;
            currentExample.add(mesh);
        }
        scene.add(currentExample);
    },

    // Nuova Scena: Cubo
    cube: () => {
        const geometry = new THREE.BoxGeometry(2, 2, 2); // Geometria cubo
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // Colore verde
            wireframe: false // Modalità solida
        });
        currentExample = new THREE.Mesh(geometry, material);
        scene.add(currentExample);
    },

    // Nuova Scena: Bolla che si divide in due
    bubble: () => {
        const geometry = new THREE.SphereGeometry(1, 32, 32); // Geometria sfera
        const material = new THREE.MeshBasicMaterial({
            color: 0x00aaff, // Colore azzurro
            transparent: true,
            opacity: 0.8
        });

        const bubble1 = new THREE.Mesh(geometry, material);
        const bubble2 = new THREE.Mesh(geometry, material);

        bubble1.position.set(0, 0, 0);
        bubble2.position.set(0, 0, 0);

        scene.add(bubble1);
        scene.add(bubble2);

        let time = 0;
        const animateBubbles = () => {
            time += 0.02;

            bubble1.position.x = Math.sin(time) * 2;
            bubble2.position.x = -Math.sin(time) * 2;

            const scale = 1 - Math.abs(Math.sin(time)) * 0.5;
            bubble1.scale.set(scale, scale, scale);
            bubble2.scale.set(scale, scale, scale);

            bubbleAnimationId = requestAnimationFrame(animateBubbles);
        };

        animateBubbles();

        currentExample = new THREE.Group();
        currentExample.add(bubble1);
        currentExample.add(bubble2);
    }
};

// ----------------------------------------------------------------------------
// Funzioni di utilità
// ----------------------------------------------------------------------------
function cleanScene() {
    if (scene) {
        scene.traverse(obj => {
            if (obj.isMesh) {
                obj.geometry.dispose();
                obj.material.dispose();
            }
        });
        scene = null;
    }
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (bubbleAnimationId) {
        cancelAnimationFrame(bubbleAnimationId);
        bubbleAnimationId = null;
    }
}

function loadExample(type) {
    cleanScene();
    scene = new THREE.Scene();
    examples[type]();
    animate();
}

// ----------------------------------------------------------------------------
// Animazione principale
// ----------------------------------------------------------------------------
function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    if (currentExample) {
        currentExample.rotation.x = time * 0.3;
        currentExample.rotation.y = time * 0.2;
        currentExample.rotation.z = time * 0.1;
    }

    renderer.render(scene, camera);
    fps++;
}

// ----------------------------------------------------------------------------
// Gestione della modalità risparmio energetico
// ----------------------------------------------------------------------------
const lowPowerModeCheckbox = document.getElementById('lowPowerMode');
if (lowPowerModeCheckbox) {
    lowPowerModeCheckbox.addEventListener('change', (e) => {
        renderer.setPowerPreference(e.target.checked ? "low-power" : "high-performance");
        renderer.setPixelRatio(e.target.checked ? 0.8 : window.devicePixelRatio);
    });
}

// ----------------------------------------------------------------------------
// Avvio dell'applicazione
// ----------------------------------------------------------------------------
init();
loadExample('wireframe'); // Carica la scena iniziale
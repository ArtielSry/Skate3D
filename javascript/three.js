const skates = [
  {
    title: "VORTEX 56",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Green, White",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor1.png", // Texture for Skate 1
  },
  {
    title: "PHANTOM",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Pink, Blue",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor2.png", // Texture for Skate 2
  },
  {
    title: "PINNACLE",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Violet, Blue",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor3.png", // Texture for Skate 3 (optional)
  },
  {
    title: "INFERNO 666",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Blue, Orange",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor4.png", // Texture for Skate 3 (optional)
  },
];

// Definición de variables globales
let currentIndex = 0; // Índice que determina qué skate se está mostrando actualmente
let currentModel = null; // El modelo 3D actual
let currentTexture = null; // La textura actual aplicada al modelo
let currentAnimation = null; // La animación de rotación en progreso
let currentTextureApplied = false; // Marca que indica si la textura ha sido aplicada al modelo
const texturesCache = {}; // Caché para almacenar las texturas cargadas y evitar recargas innecesarias

// Configuración de la escena y el renderer para visualizar los modelos en pantalla
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1.5; // Posición de la cámara en el espacio

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio); // Ajuste de la resolución
const mainContainer = document.querySelector(".model-skate"); // Contenedor del modelo 3D
renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight); // Ajuste del tamaño del renderizado
renderer.outputEncoding = THREE.sRGBEncoding; // Codificación de color
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mapeo de tonos
renderer.toneMappingExposure = 1.2; // Ajuste de la exposición
renderer.shadowMap.enabled = true; // Habilitar sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de mapa de sombras
mainContainer.appendChild(renderer.domElement); // Agregar el canvas al contenedor

// Configuración de la iluminación de la escena para mejorar la visualización del modelo 3D
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(1, 1, 1).normalize();
directionalLight1.castShadow = true;
directionalLight1.shadow.mapSize.width = 2048;
directionalLight1.shadow.mapSize.height = 2048;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-1, 1, -1).normalize();
directionalLight2.castShadow = true;
directionalLight2.shadow.mapSize.width = 2048;
directionalLight2.shadow.mapSize.height = 2048;
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight3.position.set(0, 1, -1).normalize();
directionalLight3.castShadow = true;
directionalLight3.shadow.mapSize.width = 2048;
directionalLight3.shadow.mapSize.height = 2048;
scene.add(directionalLight3);

// Cargar la textura utilizando el cargador de texturas de Three.js
const textureLoader = new THREE.TextureLoader();

// Esta función pre-carga todas las texturas de los skates antes de que se utilicen, lo que mejora el rendimiento.
// Al recorrer la lista de skates, se cargan las texturas y se almacenan en el caché.
function preloadTextures() {
  skates.forEach((skate) => {
    textureLoader.load(
      skate.texturePath,
      (texture) => {
        texture.flipY = false; // Ajustar la textura para que no se voltee en el eje Y
        texturesCache[skate.texturePath] = texture; // Almacenar la textura en el caché
      },
      undefined,
      (error) => {
        // Aquí podríamos manejar errores si la carga de la textura falla
      }
    );
  });
}

// Versión asíncrona de la función para pre-cargar texturas.
// Espera a que todas las texturas se hayan cargado antes de continuar.
async function preloadTexturesAsync() {
  const texturePromises = skates.map(
    (skate) =>
      new Promise((resolve, reject) => {
        textureLoader.load(
          skate.texturePath,
          (texture) => {
            texture.flipY = false;
            texturesCache[skate.texturePath] = texture;
            resolve();
          },
          undefined,
          (error) => {
            reject(error); // Manejo de errores si alguna textura no se carga
          }
        );
      })
  );
  try {
    await Promise.all(texturePromises); // Espera hasta que todas las promesas se resuelvan
  } catch (error) {
    // Manejo de errores
  }
}

// Función para cargar el modelo 3D del skate solo una vez para mejorar la eficiencia.
// Carga el modelo asociado al skate actual y lo añade a la escena si aún no ha sido cargado previamente.
function loadModelOnce() {
  const modelInfo = skates[currentIndex];
  const loader = new THREE.GLTFLoader();

  if (!currentModel) {
    loader.load(
      modelInfo.modelPath,
      (gltf) => {
        currentModel = gltf.scene; // Asigna el modelo cargado a la variable global
        scene.add(currentModel); // Añadir el modelo a la escena
        currentModel.scale.set(0.6, 0.6, 0.6); // Ajuste de la escala del modelo
        currentModel.rotation.set(-1.5, Math.PI / 2, 0); // Configurar la rotación inicial del modelo

        currentModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        render(); // Llamar a la función de renderizado para mostrar el modelo
        updateSkateInfo(currentIndex); // Aplicar la textura inicial del modelo
      },
      undefined,
      (error) => {
        // Aquí podríamos manejar errores si la carga del modelo falla
      }
    );
  }
}

const titleElement = document.getElementById("skateTitle");
const descriptionElement = document.getElementById("skateDescription");
const colorsElement = document.getElementById("skateColors");
const AttributionElement = document.getElementById("skateAttribution");

titleElement.classList.add("fade-out");

// Función que actualiza la información del modelo de skate actual en la interfaz del usuario.
// También maneja la aplicación de texturas al modelo 3D correspondiente.
function updateSkateInfo(index) {
  const modelInfo = skates[index];

  // Actualizar los elementos de la interfaz con la información del skate actual
  titleElement.innerText = modelInfo.title;
  descriptionElement.innerText = modelInfo.description;
  colorsElement.innerText = `Colors: ${modelInfo.colors}`;
  AttributionElement.innerText = `Attribution: ${modelInfo.Attribution}`;

  // Obtener la textura correspondiente desde el caché
  currentTexture = texturesCache[modelInfo.texturePath];

  if (currentModel && currentTexture) {
    currentTextureApplied = false; // Indicar que la textura no ha sido aplicada
    startRotationAnimation(); // Iniciar la animación de rotación al cambiar de modelo
  }
}

// Esta función inicia una animación de rotación para los skates utilizando GSAP, lo que permite una transición suave entre modelos.
// La animación rota el modelo en el eje X y se asegura de aplicar la textura en el momento adecuado.
function startRotationAnimation(rotationDirection = 1) {
  const rotationAmount = Math.PI * 2 * rotationDirection; // Rotar el modelo 360 grados

  if (currentAnimation) {
    currentAnimation.kill(); // Detener cualquier animación previa que esté en curso
  }

  currentAnimation = gsap.to(currentModel.rotation, {
    x: `+=${rotationAmount}`,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: function () {
      const tweenProgress = this.progress();

      if (tweenProgress >= 0.5 && !currentTextureApplied) {
        applyTexture(); // Aplicar la textura cuando la animación esté al 50%
        currentTextureApplied = true;
      }
    },
    onComplete: () => {
      if (!currentTextureApplied) {
        applyTexture(); // Asegurar que la textura se aplique si no se aplicó antes
      }
      render(); // Re-renderizar la escena
    },
  });
}

// Función que aplica la textura cargada al modelo 3D.
// Recorre todos los sub-meshes del modelo para asignar la textura correspondiente.
function applyTexture() {
  if (currentModel && currentTexture) {
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.material.map = currentTexture; // Aplicar la textura al material del mesh
        child.material.needsUpdate = true; // Marcar que el material necesita actualizarse
      }
    });
  }
}

// Pre-cargar todas las texturas de los modelos y luego cargar el modelo 3D correspondiente
preloadTexturesAsync();
loadModelOnce();

// Función que avanza al siguiente modelo en la lista, actualiza la información y aplica la textura correspondiente.
function nextModel() {
  currentIndex = (currentIndex + 1) % skates.length;
  updateSkateInfo(currentIndex);
  startRotationAnimation(1); // Animación en sentido positivo
}

// Función que retrocede al modelo anterior en la lista y realiza el mismo proceso de actualización de información y textura.
function prevModel() {
  currentIndex = (currentIndex - 1 + skates.length) % skates.length;
  updateSkateInfo(currentIndex);
  startRotationAnimation(-1); // Animación en sentido negativo
}

// Asignar las funciones de avanzar y retroceder a los botones de navegación en la interfaz de usuario
document.getElementById("nextModel").addEventListener("click", nextModel);
document.getElementById("prevModel").addEventListener("click", prevModel);

// Función de renderizado que mantiene actualizada la escena y controla el número de frames por segundo.
// Usa un control de tiempo para asegurar un rendimiento constante en dispositivos con diferentes capacidades.
let lastFrameTime = 0;
const fps = 30;
const frameInterval = 1000 / fps;

function render(currentTime) {
  requestAnimationFrame(render); // Llamar continuamente a la función de renderizado

  const deltaTime = currentTime - lastFrameTime;
  if (deltaTime > frameInterval) {
    renderer.render(scene, camera); // Renderizar la escena
    lastFrameTime = currentTime - (deltaTime % frameInterval);
  }
}

// Iniciar el renderizado de la escena
render();

// Ajustar el tamaño del renderizado cuando la ventana cambia de tamaño para mantener la proporción correcta.
window.addEventListener("resize", () => {
  renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
  camera.aspect = mainContainer.clientWidth / mainContainer.clientHeight;
  camera.updateProjectionMatrix();
});

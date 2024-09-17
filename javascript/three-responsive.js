const skates = [
  {
    title: "VORTEX 56",
    description: "An aggressive and modern design, ideal for street use.",
    colors: "Green, White",
    inspiration: "Inspired by urban art from New York",
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor1.png", // Texture for Skate 1
  },
  {
    title: "PHANTOM",
    description: "Classic design for skaters of all levels.",
    colors: "Pink, Blue",
    inspiration: "Inspired by forest colors",
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor2.png", // Texture for Skate 2
  },
  {
    title: "PINNACLE",
    description: "Lightweight board with futuristic graphics.",
    colors: "Violet, Blue",
    inspiration: "Minimalist style and advanced technology",
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor3.png", // Texture for Skate 3 (optional)
  },
  {
    title: "INFERNO 666",
    description: "Lightweight board with futuristic graphics.",
    colors: "Blue, Orange",
    inspiration: "Minimalist style and advanced technology",
    modelPath: "static/source/scene4.glb", // Same model for all skates
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor4.png", // Texture for Skate 3 (optional)
  },
];

// Variables globales
let currentIndex = 0;
let currentModel = null;
let currentTexture = null;
let currentAnimation = null; // Variable para almacenar la animación actual
let currentTextureApplied = false; // Marcar que la textura ha sido aplicada
const texturesCache = {}; // Caché de texturas

// Configuración de la escena y el renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1.5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
const mainContainer = document.querySelector(".model-skate");
renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
mainContainer.appendChild(renderer.domElement);

// Añadir iluminación a la escena
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

// Cargar textura
const textureLoader = new THREE.TextureLoader();

// Función para pre-cargar todas las texturas
function preloadTextures() {
  skates.forEach((skate) => {
    textureLoader.load(
      skate.texturePath,
      (texture) => {
        console.log("Textura cargada:", skate.texturePath);
        texture.flipY = false;
        texturesCache[skate.texturePath] = texture;
      },
      undefined,
      (error) => {
        console.error("Error al cargar la textura:", error);
      }
    );
  });
}

// Cargar texturas de forma asíncrona
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
            reject(error);
          }
        );
      })
  );
  try {
    await Promise.all(texturePromises);
    console.log("Todas las texturas han sido cargadas.");
  } catch (error) {
    console.error("Error al cargar texturas:", error);
  }
}

// Cargar el modelo 3D solo una vez
function loadModelOnce() {
  const modelInfo = skates[currentIndex];
  const loader = new THREE.GLTFLoader();

  // Cargar el modelo solo si no existe uno cargado
  if (!currentModel) {
    loader.load(
      modelInfo.modelPath,
      (gltf) => {
        currentModel = gltf.scene;
        scene.add(currentModel);
        currentModel.scale.set(0.5, 0.5, 0.5);
        currentModel.rotation.set(-1.5, Math.PI / 1, 0);
        currentModel.position.set(0, -0.2, 0);

        currentModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        render();
        updateSkateInfo(currentIndex); // Aplicar textura inicial
      },
      undefined,
      (error) => {
        console.error("Error al cargar el modelo:", error);
      }
    );
  }
}

const titleElement = document.getElementById("skateTitle");
const descriptionElement = document.getElementById("skateDescription");
const colorsElement = document.getElementById("skateColors");
const inspirationElement = document.getElementById("skateInspiration");

titleElement.classList.add("fade-out");

// Función para actualizar la información del skate y aplicar la textura
function updateSkateInfo(index) {
  const modelInfo = skates[index];

  // Actualizar la descripción en el DOM
  titleElement.innerText = modelInfo.title;
  descriptionElement.innerText = modelInfo.description;
  colorsElement.innerText = `Colors: ${modelInfo.colors}`;
  inspirationElement.innerText = `Inspiration: ${modelInfo.inspiration}`;

  // Usar la textura del caché si está disponible
  currentTexture = texturesCache[modelInfo.texturePath];

  if (currentModel && currentTexture) {
    // Marcar que la textura no ha sido aplicada
    currentTextureApplied = false;

    // Animar la transición de textura
    startRotationAnimation();
  }
}

// Función para iniciar la animación de rotación
function startRotationAnimation(rotationDirection = 1) {
  const rotationAmount = Math.PI * 2 * rotationDirection; // Rotación completa de 360 grados en el eje X

  // Detener cualquier animación previa
  if (currentAnimation) {
    currentAnimation.kill();
  }

  // Crear una animación con GSAP que controle la rotación en el eje X
  currentAnimation = gsap.to(currentModel.rotation, {
    x: `+=${rotationAmount}`, // Rotar el modelo en el eje X
    duration: 1, // Duración de la animación
    ease: "power2.inOut",
    onUpdate: function () {
      // Verificar el progreso de la animación
      const tweenProgress = this.progress();

      // Aplicar la textura cuando el progreso sea aproximadamente el 5%
      if (tweenProgress >= 0.5 && !currentTextureApplied) {
        console.log("Aplicando la textura al 5% de la animación");
        applyTexture(); // Aplicar la textura en el 50% de la animación
        currentTextureApplied = true; // Asegurarse de que solo se aplique una vez
      }
    },
    onComplete: () => {
      // Asegurar que la textura esté aplicada al final si no se aplicó antes
      if (!currentTextureApplied) {
        applyTexture();
      }
      render(); // Re-renderizar la escena al final de la animación
    },
  });
}

function applyTexture() {
  console.log("Aplicando la textura");
  if (currentModel && currentTexture) {
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.material.map = currentTexture; // Aplicar la textura
        child.material.needsUpdate = true; // Asegurar que el material se actualice
      }
    });
  } else {
    console.error("Modelo o textura no disponibles");
  }
}

// Precargar texturas y cargar el modelo
preloadTexturesAsync();
loadModelOnce(); // Cargar el modelo una sola vez

// Función para avanzar al siguiente modelo (cambiar textura)
function nextModel() {
  currentIndex = (currentIndex + 1) % skates.length;
  updateSkateInfo(currentIndex);
  startRotationAnimation(1); // Rotar en la dirección positiva para avanzar
}

// Función para retroceder al modelo anterior (cambiar textura)
function prevModel() {
  currentIndex = (currentIndex - 1 + skates.length) % skates.length;
  updateSkateInfo(currentIndex);
  startRotationAnimation(-1); // Rotar en la dirección negativa para retroceder
}

// Asignar eventos a los botones de navegación
document.getElementById("nextModel").addEventListener("click", nextModel);
document.getElementById("prevModel").addEventListener("click", prevModel);

// Variables globales
let lastFrameTime = 0;
const fps = 30; // Número de frames por segundo deseado
const frameInterval = 1000 / fps; // Intervalo entre frames en milisegundos

function render(currentTime) {
  requestAnimationFrame(render);

  const deltaTime = currentTime - lastFrameTime;
  if (deltaTime > frameInterval) {
    // Actualiza la escena y renderiza
    renderer.render(scene, camera);
    lastFrameTime = currentTime - (deltaTime % frameInterval);
  }
}

// Inicializar y empezar la función de renderizado
render();

// Ajustar el tamaño del renderizador cuando se cambia el tamaño de la ventana
window.addEventListener("resize", () => {
  renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
  camera.aspect = mainContainer.clientWidth / mainContainer.clientHeight;
  camera.updateProjectionMatrix();
});

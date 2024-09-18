/* This is the responsive version, for more information you can check the other JS file named "three.js" */

const skates = [
  {
    title: "VORTEX 56",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Green, White",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb", 
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor1.png", 
  },
  {
    title: "PHANTOM",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Pink, Blue",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb",
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor2.png",
  },
  {
    title: "PINNACLE",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Violet, Blue",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb",
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor3.png",
  },
  {
    title: "INFERNO 666",
    description: `Model 3D Skate  
- https://sketchfab.com/3d-models/skateboard-free-model-5fb8302331154d0b80e7aa9352a3b664
- https://creativecommons.org/licenses/by/4.0/`,
    colors: "Blue, Orange",
    Attribution: `images in skate
- https://www.freepik.es/autor/pikisuperstar`,
    modelPath: "static/source/scene4.glb",
    texturePath: "static/source/textures/SKATE_TEXTURE_baseColor4.png",
  },
];

let currentIndex = 0;
let currentModel = null;
let currentTexture = null;
let currentAnimation = null;
let currentTextureApplied = false;
const texturesCache = {};

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

const textureLoader = new THREE.TextureLoader();

function preloadTextures() {
  skates.forEach((skate) => {
    textureLoader.load(skate.texturePath, (texture) => {
      texture.flipY = false;
      texturesCache[skate.texturePath] = texture;
    });
  });
}

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
  } catch (error) {}
}

function loadModelOnce() {
  const modelInfo = skates[currentIndex];
  const loader = new THREE.GLTFLoader();

  if (!currentModel) {
    loader.load(modelInfo.modelPath, (gltf) => {
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
      updateSkateInfo(currentIndex);
    });
  }
}

const titleElement = document.getElementById("skateTitle");
const descriptionElement = document.getElementById("skateDescription");
const colorsElement = document.getElementById("skateColors");
const AttributionElement = document.getElementById("skateAttribution");

titleElement.classList.add("fade-out");

function updateSkateInfo(index) {
  const modelInfo = skates[index];

  titleElement.innerText = modelInfo.title;
  descriptionElement.innerText = modelInfo.description;
  colorsElement.innerText = `Colors: ${modelInfo.colors}`;
  AttributionElement.innerText = `Attribution: ${modelInfo.Attribution}`;

  currentTexture = texturesCache[modelInfo.texturePath];

  if (currentModel && currentTexture) {
    currentTextureApplied = false;
    startRotationAnimation();
  }
}

function startRotationAnimation(rotationDirection = 1) {
  const rotationAmount = Math.PI * 2 * rotationDirection;

  if (currentAnimation) {
    currentAnimation.kill();
  }

  currentAnimation = gsap.to(currentModel.rotation, {
    x: `+=${rotationAmount}`,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: function () {
      const tweenProgress = this.progress();
      if (tweenProgress >= 0.5 && !currentTextureApplied) {
        applyTexture();
        currentTextureApplied = true;
      }
    },
    onComplete: () => {
      if (!currentTextureApplied) {
        applyTexture();
      }
      render();
    },
  });
}

function applyTexture() {
  if (currentModel && currentTexture) {
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.material.map = currentTexture;
        child.material.needsUpdate = true;
      }
    });
  }
}

preloadTexturesAsync();
loadModelOnce();

function nextModel() {
  currentIndex = (currentIndex + 1) % skates.length;
  updateSkateInfo(currentIndex);
  startRotationAnimation(1);
}

function prevModel() {
  currentIndex = (currentIndex - 1 + skates.length) % skates.length;
  updateSkateInfo(currentIndex);
  startRotationAnimation(-1);
}

document.getElementById("nextModel").addEventListener("click", nextModel);
document.getElementById("prevModel").addEventListener("click", prevModel);

let lastFrameTime = 0;
const fps = 30;
const frameInterval = 1000 / fps;

function render(currentTime) {
  requestAnimationFrame(render);

  const deltaTime = currentTime - lastFrameTime;
  if (deltaTime > frameInterval) {
    renderer.render(scene, camera);
    lastFrameTime = currentTime - (deltaTime % frameInterval);
  }
}

render();

window.addEventListener("resize", () => {
  renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
  camera.aspect = mainContainer.clientWidth / mainContainer.clientHeight;
  camera.updateProjectionMatrix();
});

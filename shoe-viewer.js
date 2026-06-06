import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js";

const canvas = document.getElementById("shoeViewer");
const status = document.getElementById("modelStatus");
const resetButton = document.getElementById("resetView");
const loadButton = document.getElementById("loadModel");
const viewerWrap = canvas?.closest(".viewer-wrap");
const modelSlide = canvas?.closest(".slide");

if (canvas) {
  let started = false;
  let modelSlideActive = modelSlide?.classList.contains("active") || false;
  let lastRender = 0;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 7, 18);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  camera.position.set(3.8, 2.4, 5.4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;
  controls.target.set(0, 0.2, 0);

  scene.add(new THREE.HemisphereLight(0xf5f7ff, 0x1d1a2f, 2.3));
  const key = new THREE.DirectionalLight(0xffc08a, 3.8);
  key.position.set(4, 6, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6d72ff, 2.4);
  rim.position.set(-5, 2, -3);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 96),
    new THREE.MeshBasicMaterial({ color: 0x0b0d15, transparent: true, opacity: 0.72 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.92;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.008, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xe57942, transparent: true, opacity: 0.75 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.9;
  scene.add(ring);

  let shoe = null;

  async function loadShoe() {
    if (started) return;
    started = true;
    status.textContent = modelSlideActive
      ? "Loading 56MB FBX once / poster stays interactive..."
      : "Background preloading 3D model...";
    loadButton.textContent = "LOADING";
    loadButton.disabled = true;

    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (url.includes("runningshoe3dmodel_basecolor")) return "assets/model/basecolor-1024.jpeg";
      if (url.includes("runningshoe3dmodel_normal")) return "assets/model/normal-1024.jpeg";
      if (url.includes("runningshoe3dmodel_metallic")) return "assets/model/metallic-1024.jpeg";
      if (url.includes("runningshoe3dmodel_roughness")) return "assets/model/roughness-1024.jpeg";
      return url;
    });

    const textureLoader = new THREE.TextureLoader(manager);
    const [base, normal, metal, rough] = await Promise.all([
      textureLoader.loadAsync("assets/model/basecolor-1024.jpeg"),
      textureLoader.loadAsync("assets/model/normal-1024.jpeg"),
      textureLoader.loadAsync("assets/model/metallic-1024.jpeg"),
      textureLoader.loadAsync("assets/model/roughness-1024.jpeg")
    ]);
    base.colorSpace = THREE.SRGBColorSpace;
    [base, normal, metal, rough].forEach((texture) => {
      texture.flipY = true;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    const material = new THREE.MeshStandardMaterial({
      map: base,
      normalMap: normal,
      metalnessMap: metal,
      roughnessMap: rough,
      metalness: 0.16,
      roughness: 0.66,
      envMapIntensity: 1
    });

    const loader = new FBXLoader(manager);
    loader.load(
      "assets/model/shoe.fbx",
      (object) => {
        shoe = object;
        shoe.traverse((child) => {
          if (child.isMesh) {
            child.material = material;
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        const box = new THREE.Box3().setFromObject(shoe);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        shoe.position.sub(center);
        const scale = 3.2 / Math.max(size.x, size.y, size.z);
        shoe.scale.setScalar(scale);
        shoe.rotation.set(-0.04, -0.56, 0.02);
        scene.add(shoe);
        viewerWrap?.classList.add("is-loaded");
        status.textContent = "PBR model ready / drag to inspect";
        loadButton.textContent = "READY";
      },
      (event) => {
        if (event.total) {
          status.textContent = `Loading 3D ${(event.loaded / event.total * 100).toFixed(0)}% / poster stays visible`;
        }
      },
      (error) => {
        console.error(error);
        status.textContent = "3D model failed to load. Poster preview remains available.";
        loadButton.textContent = "RETRY";
        loadButton.disabled = false;
        started = false;
      }
    );
  }

  resetButton?.addEventListener("click", () => {
    camera.position.set(3.8, 2.4, 5.4);
    controls.target.set(0, 0.2, 0);
    controls.autoRotate = true;
  });
  loadButton?.addEventListener("click", loadShoe);

  const scheduleBackgroundPreload = () => {
    const preload = () => window.setTimeout(loadShoe, 900);
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preload, { timeout: 2600 });
    } else {
      window.setTimeout(preload, 1800);
    }
  };

  function resize() {
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 560;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("slidechange", (event) => {
    const activeTitle = document.querySelectorAll(".slide")[event.detail.index]?.dataset.title;
    const onModelSlide = activeTitle === "3D 预览";
    controls.autoRotate = onModelSlide;
    if (onModelSlide) window.setTimeout(loadShoe, 350);
  });

  window.addEventListener("slidechange", () => {
    modelSlideActive = modelSlide?.classList.contains("active") || false;
    controls.autoRotate = modelSlideActive;
    if (modelSlideActive) window.setTimeout(loadShoe, 120);
  });

  function animate(now = 0) {
    const shouldRender = modelSlideActive || Boolean(shoe);
    const interval = modelSlideActive ? 16 : 180;
    if (!shouldRender || now - lastRender < interval) {
      requestAnimationFrame(animate);
      return;
    }
    lastRender = now;
    if (modelSlideActive) resize();
    if (shoe) {
      ring.rotation.z += 0.003;
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  scheduleBackgroundPreload();
  animate();
}

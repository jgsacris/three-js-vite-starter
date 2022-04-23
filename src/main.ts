import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  Color,
  PCFSoftShadowMap,
  Fog
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadEnvironment } from './app/environment';
import { Landscape } from './app/landscape';
import { Places } from './app/places';

import './style.css';

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let landscape: Landscape;
let places: Places;
let controls: OrbitControls;

function init() {
  scene = new Scene();
  scene.background = new Color(0xf1f2f4);
  scene.fog = new Fog(0xffffff, 5, 500);
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 20);
  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.outputEncoding = sRGBEncoding;

  resize();
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    throw new Error('unable to find the main app div element');
  }
  app.appendChild(renderer.domElement);

  loadEnvironment(scene, renderer);

  landscape = new Landscape(scene);
  places = new Places(scene, 10);
  setupControls();
  update();
  window.addEventListener('resize', resize);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function update() {
  requestAnimationFrame(update);
  renderer.render(scene, camera);
  if (controls) {
    controls.update();
  }
  landscape.update();
}

function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
}

window.addEventListener('DOMContentLoaded', init);

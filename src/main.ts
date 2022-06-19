import {
  Scene,
  Group,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  Color,
  PCFSoftShadowMap,
  Fog,
  Vector3
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CameraViewControl } from './app/camera-view-control';
import { loadEnvironment } from './app/environment';
import { Landscape } from './app/landscape';
import { PlaceNavigator } from './app/place-navigator';
import { Places } from './app/places';

import './style.css';

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let landscape: Landscape;
let places: Places;
let placeNavigator: PlaceNavigator;
let controls: CameraViewControl;
let transformNode: Group;

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
  camera.position.set(0, 10, 20);
  camera.lookAt(new Vector3());
  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.outputEncoding = sRGBEncoding;
  transformNode = new Group();
  scene.add(transformNode);

  resize();
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    throw new Error('unable to find the main app div element');
  }
  app.appendChild(renderer.domElement);

  loadEnvironment(scene, renderer);
  setupControls();
  landscape = new Landscape(scene);
  places = new Places(transformNode, 10);
  placeNavigator = new PlaceNavigator(camera, places, controls);
  placeNavigator.navitationEndObs$.subscribe((location) => {
    console.log('locaton reached', location);
    //controls.target.copy(location);
    //controls.saveState();
    //controls.reset();
  });

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
  placeNavigator.update();
  landscape.update();
}

function setupControls() {
  controls = new CameraViewControl(renderer.domElement, transformNode);
  controls.activate();
}

window.addEventListener('DOMContentLoaded', init);

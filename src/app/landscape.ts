import {
  BoxGeometry,
  BufferAttribute,
  DirectionalLight,
  DoubleSide,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene
} from 'three';

import { Noise } from './noise/perlin2';
export class Landscape {
  private plane: Mesh;
  private directLight: DirectionalLight;
  private angle = 0;
  private dAngle = 0.005;

  constructor(private scene: Scene) {
    this.addLights();
    this.addPlane();
    // this.addCube();
  }

  public update() {
    //update scene
    const x = Math.sin(this.angle) * 4;
    const z = Math.cos(this.angle) * 4;
    this.directLight.position.set(x, 4, z);
    this.angle += this.dAngle;
  }

  private addPlane() {
    const geometry = new PlaneGeometry(1000, 1000, 120, 120);

    this.distortPlane(geometry);
    const material = new MeshStandardMaterial({
      color: 0xe3e5e3,
      roughness: 0.8,
      metalness: 0.5
    });
    material.side = DoubleSide;
    material.flatShading = true;
    this.plane = new Mesh(geometry, material);
    this.plane.rotateX(-Math.PI / 2);
    this.plane.receiveShadow = true;
    this.scene.add(this.plane);
    this.plane.geometry.attributes.position.needsUpdate = true;
    material.needsUpdate = true;
  }

  private distortPlane(geometry: PlaneGeometry) {
    const perlin = new Noise();
    const pos = Float32Array.from(geometry.attributes.position.array);
    const c = 1;
    const d = 10;
    for (let i = 2, maxI = pos.length - 1; i < maxI; i += 3) {
      //pos[i] += (Math.random() - 0.5) * 5;
      pos[i] += perlin.get(pos[i - 1] * c, pos[i + 1] * c) * d;
    }
    geometry.setAttribute('position', new BufferAttribute(pos, 3));
  }

  private addLights() {
    this.directLight = new DirectionalLight(0xffffff, 1);
    this.directLight.position.set(-3, 2, 2);
    // this.directLight.castShadow = true;
    // this.directLight.shadow.mapSize.width = 2048; // default
    // this.directLight.shadow.mapSize.height = 2048; // default
    // this.directLight.shadow.camera.near = 0.5; // default
    // this.directLight.shadow.camera.far = 500; // default
    // this.directLight.shadow.camera.left = -100;
    // this.directLight.shadow.camera.right = 100;
    // this.directLight.shadow.camera.top = 100;
    // this.directLight.shadow.camera.bottom = -100;
    this.scene.add(this.directLight);
  }

  private addCube() {
    const geometry = new BoxGeometry(1, 3, 1);

    const material = new MeshStandardMaterial({ color: 0xcc0000 });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 6, 0);
    mesh.castShadow = true;
    this.scene.add(mesh);
  }
}

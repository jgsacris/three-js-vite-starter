import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene
} from 'three';

export class Landscape {
  private plane: Mesh;
  private directLight: DirectionalLight;

  constructor(private scene: Scene) {
    this.addLights();
    this.addPlane();
  }

  public update() {
    //update scene
  }

  private addPlane() {
    const geometry = new PlaneGeometry(100, 100, 1000, 1000);
    const material = new MeshStandardMaterial({ color: 0xe3e5e3 });
    this.plane = new Mesh(geometry, material);
    this.plane.rotateX(-Math.PI / 2);
    this.scene.add(this.plane);
  }

  private addLights() {
    this.directLight = new DirectionalLight(0xffffff, 1);
    this.directLight.position.set(-2, 4, 2);
    this.scene.add(this.directLight);
    const hemisLight = new HemisphereLight(0xffffff, 0xcccccc);
    this.scene.add(hemisLight);
  }
}

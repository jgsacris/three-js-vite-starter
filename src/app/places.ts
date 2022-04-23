import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Scene,
  SpotLight,
  Vector2,
  Vector3
} from 'three';

export class Places {
  private _locations: Vector2[];
  private readonly size: number = 800;
  private readonly height: number = 7;

  constructor(private scene: Scene, private totalPlaces: number) {
    this.setLocations();
  }

  public get locations() {
    return this._locations;
  }
  private setLocations() {
    this._locations = [];
    for (let i = 0; i < this.totalPlaces - 1; i++) {
      const loc = new Vector2(
        this.getRandomCoordinate(),
        this.getRandomCoordinate()
      );
      this._locations.push(loc);
      const mesh = this.createShape(loc);
      this.addLight(loc, mesh);
    }
    const loc = new Vector2();
    this._locations.push(loc);
    const mesh = this.createShape(loc);
    this.addLight(loc, mesh);
    console.log('locations', this._locations);
  }

  private getRandomCoordinate(): number {
    return Math.floor(Math.random() * this.size - this.size / 2);
  }

  private createShape(location: Vector2) {
    const geometry = this.getRandomGeometry();
    const color = MathUtils.randInt(0, 0xffffff);

    const material = new MeshStandardMaterial({ color, flatShading: true });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(location.x, this.height, location.y);
    mesh.castShadow = true;
    this.scene.add(mesh);
    return mesh;
  }

  private getRandomGeometry(): BufferGeometry {
    const geoIndex = MathUtils.randInt(0, 2);
    switch (geoIndex) {
      case 0:
        return this.getBoxGeometry();
      case 1:
        return this.getConeGeometry();
      case 2:
        return this.getCylinderGeometry();
      default:
        return this.getBoxGeometry();
    }
  }

  private getBoxGeometry() {
    return new BoxGeometry(1, 3, 1);
  }

  private getConeGeometry() {
    return new ConeGeometry(2, 3, MathUtils.randInt(5, 23));
  }

  private getCylinderGeometry() {
    return new CylinderGeometry(0, 2, 3, MathUtils.randInt(5, 23));
  }

  private addLight(location: Vector2, mesh: Mesh) {
    const light = new SpotLight(0xffffff, 0.5, 25, 1.0, 0.5);
    light.position.set(location.x - 1, 15, location.y);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 30;
    light.shadow.camera.fov = 40;
    light.target = mesh;
    this.scene.add(light);
  }
}

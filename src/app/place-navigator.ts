import { Mesh, PerspectiveCamera, Quaternion, Vector2, Vector3 } from 'three';
import { Places } from './places';
import * as TWEEN from '@tweenjs/tween.js';
import { Subject } from 'rxjs';
import { CameraViewControl } from './camera-view-control';

export class PlaceNavigator {
  private locations: Vector2[];
  private navigationEnd$: Subject<Vector3>;

  constructor(
    private camera: PerspectiveCamera,
    private places: Places,
    private controls: CameraViewControl
  ) {
    this.createUI();
    this.navigationEnd$ = new Subject();
  }

  public get navitationEndObs$() {
    return this.navigationEnd$.asObservable();
  }

  public update() {
    TWEEN.update();
  }

  private createUI() {
    const container = document.createElement('div');
    container.className = 'placeSelector';
    const selectEl = document.createElement('select');
    this.locations = this.places.locations;
    for (let i = 0; i < this.locations.length; i++) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.innerText = 'Select: ' + i;
      selectEl.append(option);
    }
    container.append(selectEl);
    selectEl.addEventListener('change', this.onPlaceSelected);
    document.body.append(container);
  }

  private onPlaceSelected = (el: Event) => {
    console.log('on Place selected', el);
    this.controls.deactivate();
    const s = el.target as HTMLSelectElement;
    const selectedPlace = this.locations[parseInt(s.value, 10)];
    console.log('selectedPlace', selectedPlace);
    const cPos = this.camera.position.clone();
    const newPosition = new Vector3(selectedPlace.x, 2, selectedPlace.y);
    const finalPos = this.findFinalCameraPosition(newPosition);
    const tween1 = this.slowlyRotateCamera(newPosition);
    const tween2 = new TWEEN.Tween(cPos)
      .to({ x: finalPos.x, y: cPos.y, z: finalPos.y }, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((current: Vector3) => {
        this.camera.position.copy(current);
        this.camera.lookAt(newPosition);
      })
      .onComplete((current: Vector3) => {
        this.navigationEnd$.next(current);
        this.controls.activate();
      });
    tween1.chain(tween2);
  };

  private slowlyRotateCamera(target: Vector3) {
    const startRotation = new Quaternion();
    let targetRotation = new Quaternion();
    startRotation.copy(this.camera.quaternion);
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld();
    targetRotation = this.camera.quaternion.clone();
    this.camera.quaternion.copy(startRotation);
    return new TWEEN.Tween(this.camera.quaternion)
      .to(targetRotation, 1000)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();
  }

  private findFinalCameraPosition(target: Vector3) {
    const origin = new Vector2(this.camera.position.x, this.camera.position.z);
    const target2d = new Vector2(target.x, target.z);
    const distance = origin.distanceTo(target2d);
    const xU = (target2d.x - origin.x) / distance;
    const yU = (target2d.y - origin.y) / distance;
    const dU = new Vector2(xU, yU).multiplyScalar(distance - 10);
    return origin.add(dU);
  }
}

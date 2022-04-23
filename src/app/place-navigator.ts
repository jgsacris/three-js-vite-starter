import { PerspectiveCamera, Vector2, Vector3 } from 'three';
import { Places } from './places';
import * as TWEEN from '@tweenjs/tween.js';

export class PlaceNavigator {
  private locations: Vector2[];
  constructor(private camera: PerspectiveCamera, private places: Places) {
    this.createUI();
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
    const s = el.target as HTMLSelectElement;
    const selectedPlace = this.locations[parseInt(s.value, 10)];
    console.log('selectedPlace', selectedPlace);
    const cPos = this.camera.position.clone();
    this.camera.lookAt(new Vector3(selectedPlace.x, 0, selectedPlace.y));
    const tween = new TWEEN.Tween(cPos)
      .to({ x: selectedPlace.x, y: cPos.y, z: selectedPlace.y }, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((current: Vector3) => {
        this.camera.position.copy(current);
      })
      .start();
  };
}

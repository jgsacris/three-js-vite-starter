import {
  fromEvent,
  Observable,
  Subject,
  Subscription,
  take,
  takeUntil
} from 'rxjs';
import { Camera, Quaternion, Spherical, Vector2, Vector3 } from 'three';

export class CameraViewControl {
  private pointerDown$: Observable<PointerEvent>;
  private pointerMove$: Observable<PointerEvent>;
  private pointerUp$: Observable<PointerEvent>;
  private dispose$: Subject<boolean>;
  private pointerMoveSubscritpion: Subscription;
  private pointerUpSubscription: Subscription;
  private active: boolean;
  private rotateStart: Vector2;
  private rotateEnd: Vector2;
  private rotateDelta: Vector2;
  private sensitivity = 0.5;
  private quat: Quaternion;
  private spherical: Spherical;

  constructor(private domElement: HTMLElement, private camera: Camera) {
    //this.domElement.style.touchAction = 'none';
    this.domElement.style.userSelect = 'none';
    this.setupEvents();
    this.rotateStart = new Vector2();
    this.rotateEnd = new Vector2();
    this.rotateDelta = new Vector2();
    this.quat = new Quaternion().setFromUnitVectors(
      this.camera.up,
      new Vector3(0, 1, 0)
    );
    this.spherical = new Spherical();
  }

  public activate() {
    this.active = true;
  }

  public deactivate() {
    this.active = false;
    this.unsubscribeAllActions();
  }

  public update() {
    //todo
  }

  private setupEvents() {
    this.dispose$ = new Subject();
    console.log('setup events', this.domElement);
    this.pointerDown$ = fromEvent<PointerEvent>(
      this.domElement,
      'pointerdown'
    ).pipe(takeUntil(this.dispose$));
    this.pointerMove$ = fromEvent<PointerEvent>(
      this.domElement,
      'pointermove'
    ).pipe(takeUntil(this.dispose$));
    this.pointerUp$ = fromEvent<PointerEvent>(
      this.domElement,
      'pointerup'
    ).pipe(takeUntil(this.dispose$));
    this.pointerDown$.subscribe(this.onPointerDown);
  }

  private onPointerDown = (event: PointerEvent) => {
    console.log('poinerDonw, active:', this.active);
    if (!this.active) return;
    this.pointerMoveSubscritpion = this.pointerMove$
      .pipe(takeUntil(this.pointerUp$))
      .subscribe(this.onPointerMove);

    this.pointerUpSubscription = this.pointerUp$
      .pipe(take(1))
      .subscribe(this.onPointeUp);
    this.rotateStart.set(event.pageX, event.pageY);
  };

  private onPointerMove = (event: PointerEvent) => {
    console.log('move', event);
    this.rotateEnd.set(event.pageX, event.pageY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    const angYDif =
      (2 * Math.PI * this.rotateDelta.x) / this.domElement.clientHeight; // yes, height
    const newAngY = angYDif * this.sensitivity;

    const angXDif =
      (2 * Math.PI * this.rotateDelta.y) / this.domElement.clientWidth; // yes, height
    const newAngX = angXDif * this.sensitivity;
    this.rotateStart.copy(this.rotateEnd);
    this.camera.rotateY(newAngY);
    this.camera.rotateX(newAngX);
  };

  private onPointeUp = (event: PointerEvent) => {
    console.log('up', event);
  };

  private unsubscribeAllActions() {
    this.pointerMoveSubscritpion.unsubscribe();
    this.pointerUpSubscription.unsubscribe();
  }
}

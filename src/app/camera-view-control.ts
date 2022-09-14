import {
  fromEvent,
  Observable,
  Subject,
  Subscription,
  take,
  takeUntil
} from 'rxjs';
import {
  Camera,
  Euler,
  MathUtils,
  Quaternion,
  Spherical,
  Vector2,
  Vector3
} from 'three';
import { clamp } from 'three/src/math/MathUtils';

export class CameraViewControl {
  private pointerDown$: Observable<PointerEvent>;
  private pointerMove$: Observable<PointerEvent>;
  private pointerUp$: Observable<PointerEvent>;
  private dispose$: Subject<boolean>;
  private pointerMoveSubscritpion: Subscription;
  private pointerUpSubscription: Subscription;
  private active: boolean;
  private rotation: Quaternion;
  private phi: number;
  private phiSpeed: number;
  private theta: number;
  private thetaSpeed: number;
  private previous: { position: Vector2 | null; rotation: Euler };
  private current: { position: Vector2; delta: Vector2 };
  private moving: boolean;
  private phiOffset: number;
  private isNewLocation: boolean;

  constructor(private domElement: HTMLElement, private camera: Camera) {
    //this.domElement.style.touchAction = 'none';
    this.domElement.style.userSelect = 'none';

    this.current = {
      position: new Vector2(),
      delta: new Vector2()
    };
    this.previous = {
      position: null,
      rotation: new Euler()
    };
    this.phi = 0;
    this.phiSpeed = 3;
    this.theta = 0;
    this.phiOffset = 0;

    this.thetaSpeed = 1;
    this.moving = false;
    this.rotation = new Quaternion();
    this.isNewLocation = true;

    this.setupEvents();
  }

  public updateRotation(quaternion: Quaternion) {
    const rotation = new Euler().setFromQuaternion(quaternion, 'YXZ');
    this.phi = rotation.y;
    this.theta = rotation.x;
  }

  public resetRotation(newPosition: Vector3) {
    this.isNewLocation = true;
    this.camera.lookAt(newPosition);
    this.phi = 0;
  }

  public activate() {
    this.active = true;
  }

  public deactivate() {
    this.active = false;
    this.unsubscribeAllActions();
  }

  public update() {
    if (!this.moving) return;
    this.current.delta.subVectors(
      this.current.position,
      this.previous.position!
    );
    this.previous.position!.copy(this.current.position);

    const xh = this.current.delta.x / window.innerWidth;
    const yh = this.current.delta.y / window.innerHeight;

    this.phi += xh * this.phiSpeed;
    this.theta = clamp(
      this.theta + yh * this.thetaSpeed,
      -Math.PI / 3,
      Math.PI / 3
    );

    const qy = new Quaternion();

    qy.setFromAxisAngle(new Vector3(0, 1, 0), this.phi);
    const qx = new Quaternion();
    qx.setFromAxisAngle(new Vector3(1, 0, 0), this.theta);

    const q = new Quaternion();
    q.multiply(qy);
    q.multiply(qx);

    this.camera.quaternion.copy(q);
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
    if (!this.active) return;

    this.current.position.x = event.pageX - window.innerWidth / 2;
    this.current.position.y = event.pageY - window.innerHeight / 2;
    this.previous.position = this.current.position.clone();
    this.moving = true;
    this.pointerMoveSubscritpion = this.pointerMove$
      .pipe(takeUntil(this.pointerUp$))
      .subscribe(this.onPointerMove);

    this.pointerUpSubscription = this.pointerUp$
      .pipe(take(1))
      .subscribe(this.onPointeUp);
  };

  private onPointerMove = (event: PointerEvent) => {
    this.current.position.x = event.pageX - window.innerWidth / 2;
    this.current.position.y = event.pageY - window.innerHeight / 2;
  };

  private onPointeUp = (event: PointerEvent) => {
    this.moving = false;
  };

  private unsubscribeAllActions() {
    if (this.pointerMoveSubscritpion) {
      this.pointerMoveSubscritpion.unsubscribe();
      this.pointerUpSubscription.unsubscribe();
    }
  }
}

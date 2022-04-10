import { PMREMGenerator, Scene, TextureLoader, WebGLRenderer } from 'three';

export function loadEnvironment(
  scene: Scene,
  renderer: WebGLRenderer
): Promise<void> {
  return new Promise((resolve, reject) => {
    const loader = new TextureLoader();
    loader.load(
      'assets/HDR_029_Sky_Cloudy_Bg.jpg',
      (texture) => {
        const pmGenerator = new PMREMGenerator(renderer);
        pmGenerator.compileEquirectangularShader();
        const envMap = pmGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        texture.dispose();
        pmGenerator.dispose();
        console.log('env loaded', envMap);
        resolve();
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

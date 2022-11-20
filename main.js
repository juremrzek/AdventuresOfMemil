import { Application } from './common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('./env/env.gltf'); //'./sample_env/sample_env.gltf'

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        const camera_node = await this.loader.loadNode('Camera'); //nalozi kamero
        this.camera = camera_node.children[0];
        this.player = await this.loader.loadNode('Memil') //nalozi Memila
        //console.log(this.camera._translation)
        //console.log(this.player._translation)

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }

}

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
document.querySelector('.loader-container').remove();

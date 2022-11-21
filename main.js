import { Application } from './common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Movement } from './Movment.js'

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('./env/env.gltf'); //'./sample_env/sample_env.gltf'

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        const camera_node = await this.loader.loadNode('Camera'); //nalozi kamero
        console.log(camera_node)
        this.camera = camera_node.children[0];
        this.player = await this.loader.loadNode('Memil') //nalozi Memila
        this.movement = new Movement()
        const movement = this.movement
        console.log(this.scene)
        console.log(this.player._rotation)
        console.log(this.player.mesh.primitives[0].attributes.POSITION.max)
        console.log(this.camera)

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        //Event listeners
        window.addEventListener('keydown', (event) => {
            if (event.key == "w" || event.key == "W")
                movement.forward = true;
            if (event.key == "s" || event.key == "S")
                movement.backwards = true;
            if (event.key == "a" || event.key == "A")
                movement.left = true;
            if (event.key == "d" || event.key == "D")
                movement.right = true;
            if (event.key == "ArrowLeft")
                movement.rotateLeft = true;
            if (event.key == "ArrowRight")
                movement.rotateRight = true;
        });
        window.addEventListener('keyup', (event) => {
            if (event.key == "w" || event.key == "W")
                movement.forward = false;
            if (event.key == "s" || event.key == "S")
                movement.backwards = false;
            if (event.key == "a" || event.key == "A")
                movement.left = false;
            if (event.key == "d" || event.key == "D")
                movement.right = false;
            if (event.key == "ArrowLeft")
                movement.rotateLeft = false;
            if (event.key == "ArrowRight")
                movement.rotateRight = false;
        });

        //document.addEventListener("wheel", function (event) {
        //    if (0.9 <= camera.height && camera.height <= 6)
        //        camera.height += (event.deltaY / 500)
        //    if (0.9 > camera.height)
        //        camera.height = 0.9
        //    if (camera.height > 6)
        //        camera.height = 6
        //});

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();
    }

    update() {
        const t = this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        const movement = this.movement
        const direction = [0, 0, 0];
        if (movement.forward) {
            direction[2] += movement.speed * dt;
        }
        if (movement.backwards) {
            direction[2] -= movement.speed * dt;
        }
        if (movement.left) {
            direction[0] += movement.speed * dt;
        }
        if (movement.right) {
            direction[0] -= movement.speed * dt;
        }
        mat4.translate(this.player._matrix, this.player._matrix, direction);

        if (movement.rotateLeft) {
            mat4.rotateY(this.player._matrix, this.player._matrix, -movement.rotateSpeed * dt);
            
            movement.rotation -= movement.rotateSpeed * dt
            movement.rotation %= 2 * Math.PI
        }
        if (movement.rotateRight) {
            mat4.rotateY(this.player._matrix, this.player._matrix, movement.rotateSpeed * dt);
            
            movement.rotation += movement.rotateSpeed * dt
            movement.rotation %= 2 * Math.PI
        }

        //CAMERA-------------------
        const dx = Math.sin(movement.rotation)
        const dz = Math.cos(movement.rotation)

        const position = vec3.create()
        mat4.getTranslation(position, this.player._matrix)

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

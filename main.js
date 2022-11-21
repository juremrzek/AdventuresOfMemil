import { Application } from './common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Movment } from './Movment.js'

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('./env/env.gltf'); //'./sample_env/sample_env.gltf'

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        const camera_node = await this.loader.loadNode('Camera'); //nalozi kamero
        this.camera = camera_node.children[0];
        this.player = await this.loader.loadNode('Memil') //nalozi Memila
        this.movment = new Movment()
        const movment = this.movment
        console.log(this.scene)
        console.log(this.player.mesh.primitives[0].attributes.POSITION.max)

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        //Event listeners
        window.addEventListener('keydown', (event) => {
            if (event.key == "w" || event.key == "W")
                movment.forward = true;
            if (event.key == "s" || event.key == "S")
                movment.backwards = true;
            if (event.key == "a" || event.key == "A")
                movment.left = true;
            if (event.key == "d" || event.key == "D")
                movment.right = true;
            if (event.key == "ArrowLeft")
                movment.rotateLeft = true;
            if (event.key == "ArrowRight")
                movment.rotateRight = true;
        });
        window.addEventListener('keyup', (event) => {
            if (event.key == "w" || event.key == "W")
                movment.forward = false;
            if (event.key == "s" || event.key == "S")
                movment.backwards = false;
            if (event.key == "a" || event.key == "A")
                movment.left = false;
            if (event.key == "d" || event.key == "D")
                movment.right = false;
            if (event.key == "ArrowLeft")
                movment.rotateLeft = false;
            if (event.key == "ArrowRight")
                movment.rotateRight = false;
        });

        document.addEventListener("wheel", function (event) {
            if (0.9 <= camera.height && camera.height <= 6)
                camera.height += (event.deltaY / 500)
            if (0.9 > camera.height)
                camera.height = 0.9
            if (camera.height > 6)
                camera.height = 6
        });

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();
    }

    update() {
        const t = this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        const movment = this.movment
        const direction = [0, 0, 0];
        if (movment.forward) {
            direction[1] += movment.speed * dt;
            console.log(movment.forward)
        }
        if (movment.backwards) {
            direction[1] -= movment.speed * dt;
        }
        if (movment.left) {
            direction[0] += movment.speed * dt;
        }
        if (movment.right) {
            direction[0] -= movment.speed * dt;
        }
        mat4.translate(this.player._matrix, this.player._matrix, direction);

        if (movment.rotateLeft) {
            mat4.rotateZ(this.player._matrix, this.player._matrix, movment.rotateSpeed * dt);
            movment.rotation += movment.rotateSpeed * dt
            movment.rotation %= 2 * Math.PI
        }
        if (movment.rotateRight) {
            mat4.rotateZ(this.player._matrix, this.player._matrix, -movment.rotateSpeed * dt);
            movment.rotation -= movment.rotateSpeed * dt
            movment.rotation %= 2 * Math.PI
        }

        //CAMERA-------------------
        const dx = Math.sin(movment.rotation)
        const dz = Math.cos(movment.rotation)

        const position = vec3.create()
        mat4.getTranslation(position, this.player._matrix)

        const intrestPoint = vec3.create()
        vec3.add(intrestPoint, position, vec3.fromValues(dx * (15), 0, dz * (15)))

        //vec3.add(position, position, vec3.fromValues(dx * (-1 - camera.height / 3), camera.height, dz * (-1 - camera.height / 3)))
        vec3.add(position, position, vec3.fromValues(dx * (-1 - 1 / 3), 1, dz * (-1 - 1 / 3)))

        mat4.lookAt(
            this.viewMatrix,    //Matrika kamera
            position,           //Lokacija kamere
            intrestPoint,       //V katero tocko naj gleda kamera
            [0, 0, 1]           //Katera smer je gor
        );

        //mat4.perspective(this.projectionMatrix, Math.PI / (1.5 + 0.45 / camera.height), gl.canvas.width / gl.canvas.height, 0.0001, 20);
        //mat4.perspective(this.projectionMatrix, Math.PI / (1.5 + 0.45 / 1), this.gl.canvas.width / this.gl.canvas.height, 0.0001, 20);

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

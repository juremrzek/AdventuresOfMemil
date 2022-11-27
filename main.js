import { Application } from './common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Movement } from './Movment.js'

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('./env/env.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        
        const camera_node = await this.loader.loadNode('Camera_Orientation'); //nalozi kamero
        console.log(camera_node)
        this.camera = camera_node.children[0].children[0].children[0].children[0];
        this.player = await this.loader.loadNode('Memil') //nalozi Memila
        //console.log(this.player)
        mat4.rotateY(this.player._matrix, this.player._matrix, Math.PI);
        this.movement = new Movement()
        const movement = this.movement
        this.score = 0;

        let music = document.querySelector('#audio');
        music.volume = 0.3;
        music.play();

        //Event listeners
        this.canvas.addEventListener('click', e => this.canvas.requestPointerLock());
        document.addEventListener('pointerlockchange', e => {
            if (document.pointerLockElement === this.canvas) {
                this.interactable = true
            } else {
                this.interactable = false
            }
        });

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
            if (event.key == " ")
                if(movement.canJump){
                    movement.yspeed = 10;
                    movement.canJump = false;
                }
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

        document.addEventListener('mousemove', (event) => {
            movement.rotate = true
            movement.rotateSpeed = event.movementX
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
        const movement = this.movement
        
        const t = this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.interactable) {
            let direction = vec3.create();
            if (movement.forward) {
                vec3.add(direction, direction, vec3.fromValues(0, 0, movement.speed * dt));
            }
            if (movement.backwards) {
                vec3.add(direction, direction, vec3.fromValues(0, 0, -movement.speed * dt / 2));
            }
            if (movement.left) {
                vec3.add(direction, direction, vec3.fromValues(movement.speed * dt / 2, 0, 0));
            }
            if (movement.right) {
                vec3.add(direction, direction, vec3.fromValues(-movement.speed * dt / 2, 0, 0));
            }

            //y translation
            vec3.add(direction, direction, vec3.fromValues(0, movement.yspeed * dt, 0));
            movement.yspeed -= movement.yacc*dt;

            if (!vec3.equals(direction, vec3.fromValues(0, 0, 0)))
                vec3.rotateY(direction, direction, vec3.fromValues(0, 0, 0), this.player._rotation[1]);

            vec3.add(this.player._translation, this.player._translation, direction);

            if (movement.rotate) {
                const rotation = movement.rotateSpeed * dt
                vec3.add(this.player._rotation, this.player._rotation, [0, -rotation, 0]);
            }
        }
        this.player.updateTransformationMatrix()
        if (movement.resolveCollisions(this.player, this.scene)) {
            this.score++;
        }

        if(this.score == 5){
            let music = document.querySelector('#audio');
            music.pause();
            let cheer = document.querySelector('#cheer');
            cheer.volume = 0.5;
            cheer.play();
            this.score++;

            let end_screen = document.querySelector('#popupOpis');
            end_screen.style.display = "block";
            document.exitPointerLock()
            this.interactable = false
        }

        this.camera._matrix = mat4.create()

        mat4.copy(this.camera._matrix, this.player._matrix)
        mat4.rotateY(this.camera._matrix, this.camera._matrix, Math.PI);
        const dx = movement.cameraDist * Math.cos(movement.positionalOffsetAngle)
        const dz = movement.cameraDist * Math.sin(movement.positionalOffsetAngle)
        const dCamera = vec3.fromValues(dx, 0.7, dz)

        mat4.translate(this.camera._matrix, this.camera._matrix, dCamera)

        movement.updateCages(this.scene, dt);

        movement.rotate = false
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

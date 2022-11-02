import {Application} from './Application.js'
import {shaders} from './shaders.js'
const mat4 = glMatrix.mat4;

class Game extends Application {
    start(){
        //Create any variables
        const gl = this.gl;
        this.player = new Player();
        const player = this.player; //so we don't have to call this every time
        this.cameraEye = [1,1,1]
        this.time = performance.now();
        this.startTime = this.time;
        
        //Create vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, shaders.shader1.vertex); //set string source from shaders.js
        gl.compileShader(vertexShader);

        //Create fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaders.shader1.fragment);
        gl.compileShader(fragmentShader);

        //Create program and attach shaders
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Try to link.
        gl.linkProgram(program);

        // Get link status and report error if linkage failed.
        const programStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!programStatus) {
            const log = gl.getProgramInfoLog(program);
            console.log(gl.getShaderInfoLog(vertexShader));
            console.log(gl.getShaderInfoLog(fragmentShader));
            throw new Error('Cannot link program\nInfo log:\n' + log);
        }

        //Start program
        gl.useProgram(program);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.depthFunc(gl.LESS);
 
        //3 BUFFERJI - Vertices, indices (triangle index) and colors
        const vertices = new Float32Array([ 
            //xyzw position      //rgb color
            -1, -1, -1,     0, 0, 0,
            -1, -1,  1,     0, 0, 1,
            -1,  1, -1,     0, 1, 0,
            -1,  1,  1,     0, 1, 1,
             1, -1, -1,     1, 0, 0,
             1, -1,  1,     1, 0, 1,
             1,  1, -1,     1, 1, 0,
             1,  1,  1,     1, 1, 1,
        ]);
        //this.vao = gl.createVertexArray();
        //gl.bindVertexArray(this.vao);

        const verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(
            aPositionLoc, //attribute location
            3, //število komponent
            gl.FLOAT, //tip komponent
            false, //normalize
            6*4, //stride - velikost posameznega bloka podatkov v arrayu - kjer se podatki začnejo ponovno pošiljati za drug objekt.
            0, //offset - offset v bloku. Na prvem atributu je 0, potem pa treba incrementat, drugače bi overwritali data.
        );

        const aColorLoc = gl.getAttribLocation(program, 'aColor');
        gl.enableVertexAttribArray(aColorLoc);
        gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 6*4, 3*4);
        
        const indices = new Uint16Array([
            0, 1, 2,    2, 1, 3,
            4, 0, 6,    6, 0, 2,
            5, 4, 7,    7, 4, 6,
            1, 5, 3,    3, 5, 7,
            6, 2, 7,    7, 2, 3,
            1, 0, 5,    5, 0, 4,
        ]);
        
        this.indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        //CAMERA-----------------------------------------------------------------------------------------------------------------------------
        this.modelMatrix = mat4.create();
        this.cameraMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        mat4.scale(this.modelMatrix, this.modelMatrix, [.5, .5, .5]);
        //Matrika, [x, y, z] lokacija kamere, [x, y, z] kam gleda kamera, up <- vse relative na svet!!
        mat4.lookAt(this.cameraMatrix, [-1, 1, 0], this.player.pos, [0, 1, 0]);
        mat4.perspective(this.projectionMatrix, Math.PI/1.5, gl.canvas.width/gl.canvas.height, 0.0001, 20);

        //Event listeners
        window.addEventListener('keydown', (event) => {
            if(event.key == "w" || event.key == "W")
                this.player.forward = true;
            if(event.key == "s" || event.key == "A")
                this.player.backwards = true;
            if(event.key == "a" || event.key == "S")
                this.player.left = true;
            if(event.key == "d" || event.key == "D")
                this.player.right = true;
            if(event.key == "ArrowLeft")
                this.player.rotateLeft = true;
            if(event.key == "ArrowRight")
                this.player.rotateRight = true;
        });
        window.addEventListener('keyup', (event) => {
            if(event.key == "w" || event.key == "W")
                this.player.forward = false;
            if(event.key == "s" || event.key == "A")
                this.player.backwards = false;
            if(event.key == "a" || event.key == "S")
                this.player.left = false;
            if(event.key == "d" || event.key == "D")
                this.player.right = false;
            if(event.key == "ArrowLeft")
                this.player.rotateLeft = false;
            if(event.key == "ArrowRight")
                this.player.rotateRight = false;
        });

        //Matrike pošljemo v shader kot uniforme
        this.uModelMatrixLoc = gl.getUniformLocation(program, 'uModelMatrix');
        this.uCameraMatrixLoc = gl.getUniformLocation(program, 'uCameraMatrix');
        this.uProjectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
        gl.uniformMatrix4fv(this.uModelMatrixLoc, false, this.modelMatrix);
        gl.uniformMatrix4fv(this.uCameraMatrixLoc, false, this.cameraMatrix);
        gl.uniformMatrix4fv(this.uProjectionMatrixLoc, false, this.projectionMatrix);

        //Draw triangles - each point in bufferData is a vertex.
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
    update(){
        //get dt so that the game is equally fast regardless of device performance
        const t = this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        const gl = this.gl;
        const player = this.player;
        player.direction = [0,0,0];
        //PLAYER MOVEMENT
        if(this.player.forward){
            player.direction[0] += player.speed*dt;
        }
        if(this.player.backwards){
            player.direction[0] -= player.speed*dt;
        }
        if(this.player.left){
            player.direction[2] -= player.speed*dt;
        }
        if(this.player.right){
            player.direction[2] += player.speed*dt;
        }
        if(this.player.rotateLeft){
            mat4.rotateY(this.modelMatrix, this.modelMatrix, player.rotateSpeed*dt);
        }
        if(this.player.rotateRight){
            mat4.rotateY(this.modelMatrix, this.modelMatrix, -player.rotateSpeed*dt);
        }
        mat4.translate(this.modelMatrix, this.modelMatrix, player.direction);

        mat4.getTranslation(this.player.pos, this.modelMatrix);
        gl.uniformMatrix4fv(this.uModelMatrixLoc, false, this.modelMatrix)
        //mat4.lookAt(this.cameraMatrix, this.cameraEye, player.pos, [0, 1, 0]);
        //gl.uniformMatrix4fv(this.uCameraMatrixLoc, false, this.cameraMatrix);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
    render(){
        const gl = this.gl;
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
}

  
// resize the canvas to fill browser window dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas, false);

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//canvas.width = 400;
//canvas.height = 400;
const game = new Game(canvas);
await game.init();

function toRadians(degrees){
    return degrees * (Math.PI/180);
}
function toDegrees(radians){
    return radians * (180/Math.PI);
}
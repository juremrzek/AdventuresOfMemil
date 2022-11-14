import {Application} from './Application.js'
import {shaders} from './shaders.js'
import {Camera} from './Camera.js'
import {Node} from './Node.js'
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

class Game extends Application {
    async start(){
        //Create global variables
        this.player = new Player();
        this.camera = new Camera();
        this.cameraEye = [1,1,1]
        this.time = performance.now();
        this.startTime = this.time;

        //Local variables so we don't have to call this every time
        const gl = this.gl;
        const player = this.player;
        const camera = this.camera;

        //---------WebGL initialization-----------------------------------------------------------------------------------------
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

        //Start the program and enable depth test
        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.depthFunc(gl.LESS);
        //-------------------------------------------------------------------------------------------------------------------------------------
        
 
        //Node creation
        this.root = new Node();
        player.node = new Node();
        this.playerBody = new Node();
        this.playerArmour = new Node();
        this.enviromentBase = new Node();

        player.node.mesh = this.loadMesh(await this.loadJSON('./models/Memil.json', 0));
        this.playerBody.mesh = this.loadMesh(await this.loadJSON('./models/Memil.json', 1));
        this.playerArmour.mesh = this.loadMesh(await this.loadJSON('./models/Memil.json', 2));
        this.enviromentBase.mesh = this.loadMesh(await this.loadJSON('./models/Enviroment1.json', 8));

        this.root.addChild(player.node);
        this.root.addChild(this.enviromentBase);
        player.node.addChild(this.playerBody);
        player.node.addChild(this.playerArmour);
        //mat4.scale(this.enviromentBase.matrix, this.enviromentBase.matrix, [.6, .6, .6]);

        //Kreiranje MVP matrik
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        mat4.scale(player.node.matrix, player.node.matrix, [.4, .4, .4]);
        mat4.lookAt(
            this.viewMatrix,   //Matrika kamera
            [0, 0, -1],        //Lokacija kamere
            player.pos,        //V katero točko naj gleda kamera
            [0, 1, 0]          //Katera smer je gor
        );
        mat4.perspective(this.projectionMatrix, Math.PI/1.5, gl.canvas.width/gl.canvas.height, 0.0001, 20);

        //Event listeners
        window.addEventListener('keydown', (event) => {
            if(event.key == "w" || event.key == "W")
                player.forward = true;
            if(event.key == "s" || event.key == "A")
                player.backwards = true;
            if(event.key == "a" || event.key == "S")
                player.left = true;
            if(event.key == "d" || event.key == "D")
                player.right = true;
            if(event.key == "ArrowLeft")
                player.rotateLeft = true;
            if(event.key == "ArrowRight")
                player.rotateRight = true;
        });
        window.addEventListener('keyup', (event) => {
            if(event.key == "w" || event.key == "W")
                player.forward = false;
            if(event.key == "s" || event.key == "A")
                player.backwards = false;
            if(event.key == "a" || event.key == "S")
                player.left = false;
            if(event.key == "d" || event.key == "D")
                player.right = false;
            if(event.key == "ArrowLeft")
                player.rotateLeft = false;
            if(event.key == "ArrowRight")
                player.rotateRight = false;
        });

        document.addEventListener("wheel", function (event) {
            if (0.9 <= camera.height && camera.height <= 6)
                camera.height += (event.deltaY / 500)
            if (0.9 > camera.height)
                camera.height = 0.9
            if (camera.height > 6)
                camera.height = 6
        });

        //Izračunamo MVP matriko in pošljemo v vertex shader
        this.uMvpMatrixLoc = gl.getUniformLocation(program, 'uMvpMatrix');
        this.mvpMatrix = getMvpMatrix(this.player.node.matrix, this.viewMatrix, this.projectionMatrix);
        gl.uniformMatrix4fv(this.uMvpMatrixLoc, false, this.mvpMatrix);

        //Shading
        this.uLightDirectionLoc = gl.getUniformLocation(program, 'uLightDirection');
        this.lightDirection = [1, 0, -1];
        gl.uniform3fv(this.uLightDirectionLoc, this.lightDirection);
        
    }
    update(){
        //get dt so that the game is equally fast regardless of device performance
        const t = this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        const gl = this.gl;
        const player = this.player;
        player.direction = [0,0,0];
        const camera = this.camera

        //PLAYER MOVEMENT
        if(player.forward){
            player.direction[2] += player.speed*dt;
        }
        if(player.backwards){
            player.direction[2] -= player.speed*dt;
        }
        if(player.left){
            player.direction[0] += player.speed*dt;
        }
        if(player.right){
            player.direction[0] -= player.speed*dt;
        }
        if(player.rotateLeft){
            mat4.rotateY(this.player.node.matrix, this.player.node.matrix, player.rotateSpeed*dt);
            player.rotation += player.rotateSpeed * dt
            player.rotation %= 2*Math.PI
        }
        if(player.rotateRight){
            mat4.rotateY(this.player.node.matrix, this.player.node.matrix, -player.rotateSpeed*dt);
            player.rotation -= player.rotateSpeed * dt
            player.rotation %= 2*Math.PI
        }
        mat4.translate(this.player.node.matrix, this.player.node.matrix, player.direction);
        //Update player position
        mat4.getTranslation(player.pos, this.player.node.matrix);

        //CAMERA-------------------
        const dx = Math.sin(player.rotation)
        const dz = Math.cos(player.rotation)

        vec3.add(camera.pos, player.pos, vec3.fromValues(dx * (-1 - camera.height/3), camera.height, dz * (-1 - camera.height/3)))

        const intrestPoint = vec3.create()
        vec3.add(intrestPoint, player.pos, vec3.fromValues(dx * (15), 0, dz * (15)))

        mat4.lookAt(
            this.viewMatrix,    //Matrika kamera
            camera.pos,         //Lokacija kamere
            intrestPoint,       //V katero točko naj gleda kamera
            [0, 1, 0]           //Katera smer je gor
        );
        mat4.perspective(this.projectionMatrix, Math.PI / (1.5 + 0.45/camera.height), gl.canvas.width / gl.canvas.height, 0.0001, 20);
        //-----------------------

        //Shading
        vec3.rotateY(this.lightDirection, this.lightDirection, [0,0,0], 0.02);
        gl.uniform3fv(this.uLightDirectionLoc, this.lightDirection);
    }
    render(){
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let mvpMatrix = mat4.create();
        mvpMatrix = mat4.mul(mvpMatrix, this.projectionMatrix, this.viewMatrix);
        const mvpStack = [];
        this.root.traverse(
            node => {
                mvpStack.push(mat4.clone(mvpMatrix));
                mat4.mul(mvpMatrix, mvpMatrix, node.matrix);
                if (node.mesh) {
                    gl.bindVertexArray(node.mesh.vao);
                    gl.uniformMatrix4fv(this.uMvpMatrixLoc, false, mvpMatrix);
                    gl.drawElements(gl.TRIANGLES, node.mesh.indicesCount, gl.UNSIGNED_SHORT, 0);
                }
            },
            node => {
                mvpMatrix = mvpStack.pop();
            }
        );
    }
    loadMesh(mesh){
        const gl = this.gl;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
        const vertices = new Float32Array(mesh.vertices);
        const verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(
            0,            //attribute location
            3,            //število komponent
            gl.FLOAT,     //tip komponent
            false,        //normalize
            3*4,          //stride - velikost posameznega bloka podatkov v arrayu - kjer se podatki začnejo ponovno pošiljati za drug objekt.
            0,            //offset - odmik v bloku. Na prvem atributu je 0, potem pa treba incrementat, drugače bi overwritali data.
        );

        //gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 6*4, 3*4);
        const indices = new Uint16Array(mesh.faces.flat(1));
        const indicesCount = indices.length;
        this.indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
        const normals = new Float32Array(mesh.normals);
        this.normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 3*4, 0);

        return {vao, indicesCount}
    }
    async loadJSON(src, meshnum){
        const response = await fetch(src);
        const json = await response.json();
        return json.meshes[meshnum]
    }
}
//Začetek programa
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const game = new Game(canvas);
await game.init();

function getMvpMatrix(modelMatrix, viewMatrix, projectionMatrix){
    let mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
    mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
    return mvpMatrix;
}
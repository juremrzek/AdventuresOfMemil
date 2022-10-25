import {Application} from './Application.js'
import {shaders} from './shaders.js'

class Game extends Application {
    start(){
        const gl = this.gl;
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
            //throw new Error('Cannot link program\nInfo log:\n' + log);
            console.log(gl.getShaderInfoLog(vertexShader));
            console.log(gl.getShaderInfoLog(fragmentShader));
        }

        //Draw shaders
        gl.useProgram(program);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
    update(){
        
    }
    render(){
        
    }
    resize(){
        console.log("resized :)");
    }
}

const canvas = document.getElementById("canvas");
canvas.width  = 1280;
canvas.height = 700;
const game = new Game(canvas);
await game.init();
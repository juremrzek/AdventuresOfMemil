import {Application} from './Application.js'

class Game extends Application {
    start(){

    }
    update(){
        
    }
    render(){
        const gl = this.gl;
        gl.clearColor(0, 1, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
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
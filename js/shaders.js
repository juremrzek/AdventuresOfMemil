const vertex = `#version 300 es //vedno na začetku
    //uniform vec2 uOffset;
    void main(){
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0); //točka naj bo na sredini
        gl_PointSize = 150.0; //povečamo točko, zdaj je kvadrat velikosti 150px
    }
`;
const fragment = `#version 300 es
    precision mediump float; //vedno po verziji (samo fragment shader)
    out vec4 fragColor;
    void main(){
        fragColor = vec4(0.0, 1.0, 0.0, 1.0); //točka naj bo zelena
    }
`;
export const shaders = {
    shader1: { vertex, fragment }
};
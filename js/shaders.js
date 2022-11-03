const vertex = `#version 300 es
    uniform mat4 uMvpMatrix;

    in vec4 aPosition;
    //in vec4 aColor;

    //out vec4 vColor;
    
    void main(){
        gl_Position = uMvpMatrix*aPosition;
    }
`;
const fragment = `#version 300 es
    precision mediump float;
    //in vec4 vColor;

    out vec4 oColor;

    void main(){
        oColor = vec4(.5,.5,.5,1);
    }
`;
export const shaders = {
    shader1: { vertex, fragment }
};
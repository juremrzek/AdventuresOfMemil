const vertex = `#version 300 es
    uniform mat4 uModelMatrix;
    uniform mat4 uCameraMatrix;
    uniform mat4 uProjectionMatrix;

    in vec4 aPosition;
    in vec4 aColor;

    out vec4 vColor;
    
    void main(){
        vColor = aColor;
        gl_Position = uProjectionMatrix*uCameraMatrix*uModelMatrix*aPosition;
    }
`;
const fragment = `#version 300 es
    precision mediump float;
    in vec4 vColor;

    out vec4 oColor;

    void main(){
        //oColor = vec4(0,1,0,1);
        oColor = vColor;
    }
`;
export const shaders = {
    shader1: { vertex, fragment }
};
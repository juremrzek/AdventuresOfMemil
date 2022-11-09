const vertex = `#version 300 es
    uniform mat4 uMvpMatrix;
    uniform vec3 uLightDirection;

    in vec4 aPosition;
    in vec3 aNormal;

    out vec3 vNormal;
    out vec3 vLightDirection;

    void main(){
        vNormal = normalize(mat3(uMvpMatrix)*aNormal);
        vLightDirection = normalize(uLightDirection);
        gl_Position = uMvpMatrix*aPosition;
    }
`;
const fragment = `#version 300 es
    precision mediump float;

    in vec3 vNormal;
    in vec3 vLightDirection;

    out vec4 oColor;
    vec4 color = vec4(.6,.6,.6,1);

    void main(){
        float brightness = max(dot(vLightDirection, vNormal), 0.0);
        oColor = (color * 0.4) + (color * brightness * 0.6);
        oColor.a = 1.0;
    }
`;
export const shaders = {
    shader1: { vertex, fragment }
};
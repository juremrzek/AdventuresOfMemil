const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 3) in vec2 aTexCoord;

uniform mat4 uModelViewProjection;
uniform vec3 uLightDirection;
uniform mat4 uInverseTranspose;

out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vLightDirection;
out vec4 vPosition;

void main() {
    vNormal = normalize(mat3(uInverseTranspose)*aNormal);
    //vNormal = aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uModelViewProjection * aPosition;
    vLightDirection = normalize(uLightDirection-vec3(gl_Position));
    vPosition = gl_Position;
}
`;

const fragment = `#version 300 es
precision mediump float;
precision mediump sampler2D;

in vec3 vNormal;
in vec3 vLightDirection;
in vec3 vBaseColor;
in vec4 vPosition;

uniform sampler2D uBaseColorTexture;
uniform vec4 uBaseColorFactor;

in vec2 vTexCoord;

out vec4 oColor;

vec3 ambientColor = vec3(0.3, 0.3, 0.3);
vec3 diffuseColor = vec3(0.8, 0.8, 0.8);
vec3 specularColor = vec3(0.9, 0.9, 0.9);
float specularExp = 80.0;
vec3 lightColor = vec3(1, 1, 1);

vec3 getReflection(vec3 lightDirection, vec3 normal){
    return 2.0*max(dot(lightDirection, normal), 0.0)*normal - lightDirection;
}

void main() {
    vec3 reflection = -normalize(getReflection(vLightDirection, vNormal));
    vec3 eye = normalize(-vec3(vPosition));
    
    vec3 baseColor = vec3(texture(uBaseColorTexture, vTexCoord));
    //baseColor = vec3(1, 1, 1);

    vec3 ambient = baseColor * ambientColor;
    vec3 diffuse = baseColor * max(dot(vLightDirection, vNormal), 0.0) * diffuseColor;
    vec3 specular = lightColor*specularColor*pow(max(dot(reflection, eye), 0.0), specularExp);
    oColor = vec4(ambient + diffuse + specular, 1);
    oColor.a = 1.0;
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
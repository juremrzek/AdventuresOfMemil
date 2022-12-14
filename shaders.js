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
out vec3 vPosition;

void main() {
    vNormal = normalize(mat3(uInverseTranspose)*aNormal);
    vTexCoord = aTexCoord;
    vec4 position = uModelViewProjection * aPosition;
    vLightDirection = normalize(uLightDirection-vec3(position));
    vPosition = vec3(position);
    gl_Position = position;
}
`;

const fragment = `#version 300 es
precision mediump float;
precision mediump sampler2D;

in vec3 vNormal;
in vec3 vLightDirection;
in vec3 vBaseColor;
in vec3 vPosition;

uniform sampler2D uBaseColorTexture;
uniform vec4 uBaseColorFactor;

uniform float uAmbientScalar;
uniform float uDiffuseScalar;
uniform float uSpecularScalar;
uniform float uSpecularExp;

in vec2 vTexCoord;

out vec4 oColor;

vec3 lightColor = vec3(1, 1, 1);

vec3 getReflection(vec3 lightDirection, vec3 normal){
    return 2.0*max(dot(lightDirection, normal), 0.0)*normal - lightDirection;
}

void main() {
    vec3 reflection = normalize(reflect(-vLightDirection, vNormal));
    vec3 eye = normalize(-vPosition);
    
    vec3 baseColor = vec3(texture(uBaseColorTexture, vTexCoord));

    vec3 ambient = baseColor * uAmbientScalar;
    vec3 diffuse = baseColor * max(dot(vLightDirection, vNormal), 0.0) * uDiffuseScalar;
    vec3 specular = lightColor*uSpecularScalar*pow(max(dot(reflection, eye), 0.0), uSpecularExp);
    oColor = vec4(ambient + diffuse + specular, 1);
    oColor.a = 1.0;
}
`;

export const shaders = {
    simple: { vertex, fragment }
};
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float uTimeFactor;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main() {
    vec4 vertex = vec4(aVertexPosition, 1.0);
    
    gl_Position = uPMatrix * uMVMatrix * vertex;
    
    vTextureCoord = aTextureCoord;
    
    // Simple lighting calculation
    vec3 transformedNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
    vLightWeighting = vec3(0.3 + directionalLightWeighting * 0.7);
}
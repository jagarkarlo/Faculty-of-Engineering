attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec3 vNormal;
varying vec3 vLightWeighting;

void main() {
    vec4 vertex = vec4(aVertexPosition, 1.0);
    
    gl_Position = uPMatrix * uMVMatrix * vertex;
    
    // Pass normal to fragment shader
    vNormal = normalize((uNMatrix * vec4(aVertexNormal, 0.0)).xyz);
    
    // Basic lighting calculation
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    float directionalLightWeighting = max(dot(vNormal, lightDirection), 0.0);
    vLightWeighting = vec3(0.2 + directionalLightWeighting * 0.8);
}
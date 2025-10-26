precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float uTime;
uniform float uFlameIndex;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
    // Calculate displacement factor based on vertex Y position
    float displacementFactor = smoothstep(0.0, 1.0, aVertexPosition.y + 1.0);
    
    // Create waving effect with time and per-flame variation
    float wave = sin(uTime * 2.0 + uFlameIndex * 10.0) * 0.3;
    wave += sin(uTime * 5.0 + uFlameIndex * 5.0) * 0.15;
    
    // Add some randomness
    float randomOffset = sin(uFlameIndex * 100.0) * 0.1;
    
    // Calculate displacement - stronger at the top of the flame
    vec3 displacement = vec3(
        (wave + randomOffset) * displacementFactor,
        0.0,
        0.0
    );
    
    // Apply displacement to vertex position
    vec3 displacedPosition = aVertexPosition + displacement;
    
    // Standard transformations
    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
    
    // Pass through texture coordinates and normal
    vTexCoord = aTexCoord;
    vNormal = vec3(uNMatrix * vec4(aNormal, 1.0));
}
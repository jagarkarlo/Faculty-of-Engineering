
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;

varying vec2 vTextureCoord;
uniform sampler2D uSampler2;

uniform float normScale;

void main() {
    
    float offsetX = sin(timeFactor * 0.1) * normScale * 0.05;
    
    // nova pozicija verteksa
    vec3 newPosition = aVertexPosition + vec3(offsetX, 0.0, 0.0);
    
    // postavi gl_Position
    gl_Position = uPMatrix * uMVMatrix * vec4(newPosition, 1.0);
}


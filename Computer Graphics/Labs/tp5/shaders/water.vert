attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float timeFactor;
uniform sampler2D uSampler2; // heightmap (waterMap.jpg)

varying vec2 vTextureCoord;

void main() {
    // Dohvati visinu iz heightmape
    vec4 heightData = texture2D(uSampler2, aTextureCoord);

    // Izračunaj pomak po Y, koristeći jednu komponentu heightmape (npr. crvenu)
    float height = heightData.r;

    // Animacija sa sin funkcijom – osciliranje
    float wave = sin((aVertexPosition.x + aVertexPosition.z + timeFactor) * 0.3);

    // Pomakni vertiks po Y osi
    vec3 newPosition = aVertexPosition + vec3(0.0, height * wave * 0.5, 0.0);

    // Postavi poziciju i proslijedi texture coord
    gl_Position = uPMatrix * uMVMatrix * vec4(newPosition, 1.0);
    vTextureCoord = aTextureCoord;
}

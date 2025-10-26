#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler; // glavni vizuelni prikaz (waterTex.jpg)

varying vec2 vTextureCoord;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = texColor;
}

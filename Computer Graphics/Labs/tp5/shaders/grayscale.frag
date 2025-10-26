precision mediump float;

uniform sampler2D uSampler;

varying vec2 vTextureCoord;

void main() {
    vec4 color = texture2D(uSampler, vTextureCoord);
    float L = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    gl_FragColor = vec4(vec3(L), 1.0);
}




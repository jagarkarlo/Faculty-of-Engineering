precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;
uniform float uTime;

void main() {
    // Sample texture with some distortion based on time
    vec2 distortedTexCoord = vTexCoord;
    distortedTexCoord.x += sin(vTexCoord.y * 10.0 + uTime * 3.0) * 0.02;
    
    // Get base color from texture
    vec4 textureColor = texture2D(uSampler, distortedTexCoord);
    
    // Add glow effect based on vertical position
    float glow = smoothstep(0.3, 1.0, vTexCoord.y);
    textureColor.rgb += glow * vec3(0.8, 0.4, 0.1);
    
    // Add some transparency variation
    textureColor.a *= 0.8 + 0.2 * sin(uTime * 2.0 + vTexCoord.y * 5.0);
    
    gl_FragColor = textureColor;
}
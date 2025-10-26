precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

uniform sampler2D uSampler1;      // Normal texture (H)
uniform sampler2D uSampler2;      // Special texture (UP/DOWN)
uniform float uTimeFactor;        // Time for animation
uniform int uManeuverState;       // 0=normal, 1=takeoff, 2=landing
uniform float uBlinkFrequency;    // Frequency of blinking (Hz)

void main() {
    vec4 normalTexture = texture2D(uSampler1, vTextureCoord);
    vec4 specialTexture = texture2D(uSampler2, vTextureCoord);
    
    vec4 finalColor = normalTexture;

    if (uManeuverState > 0) {
        // Oscillate from 0 to 1 using sine wave
        float rawBlink = sin(uTimeFactor * uBlinkFrequency * 6.28318) * 0.5 + 0.5;

        // Apply smoothing to fade more gently
        float blinkValue = smoothstep(0.2, 0.8, rawBlink);

        // Blend textures using smooth blinking factor
        finalColor = mix(normalTexture, specialTexture, blinkValue);
    }

    // Apply lighting
    finalColor.rgb *= vLightWeighting;
    finalColor.a = 1.0;
    
    gl_FragColor = finalColor;
}

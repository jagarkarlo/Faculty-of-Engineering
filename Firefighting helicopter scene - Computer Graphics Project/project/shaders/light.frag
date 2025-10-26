precision mediump float;

varying vec3 vNormal;
varying vec3 vLightWeighting;

uniform float uTimeFactor;        // Time for animation
uniform int uManeuverState;       // 0=normal, 1=takeoff, 2=landing
uniform float uPulseFrequency;    // Frequency of pulsation (Hz)
uniform vec3 uLightColor;         // Base light color
uniform vec3 uInactiveColor;      // Color when inactive

void main() {
    vec3 finalColor = uInactiveColor;
    float emissionIntensity = 0.0;
    
    if (uManeuverState > 0) {
        // Calculate sinusoidal pulsation
        float pulseValue = sin(uTimeFactor * uPulseFrequency * 6.28318); // 2 * PI
        
        // Convert from [-1,1] to [0.3,1.0] for smoother pulsation
        emissionIntensity = 0.3 + 0.7 * abs(pulseValue);
        
        // Calculate final color with emissive properties
        finalColor = uLightColor * emissionIntensity;
        
        // Add some ambient lighting to prevent complete darkness
        finalColor += vLightWeighting * 0.1;
    } else {
        // Inactive state - just basic material color with lighting
        finalColor = uInactiveColor * vLightWeighting;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

uniform float uTime;

#include "../../../../utils/shaders/functions.glsl"
#include "../../../../utils/shaders/snoise.glsl"

void main() {
    // Normalize the coordinates for the fragment
    //vec2 st = gl_FragCoord.xy / u_resolution.xy;
    //st.x *= u_resolution.x / u_resolution.y;

    //vec2 st = gl_FragCoord.xy / vec2(gl_FragCoord.z, gl_FragCoord.z);  // automatically derived resolution
    
    // Generate noise for the base texture
    float noiseBase = snoise(vUv * 2000.0 + sin(uTime * 0.3));
    noiseBase = noiseBase * 0.5 + 0.5;
    vec3 colorBase = vec3(noiseBase);

    // Calculate foam effect using smoothstep and thresholding
    vec3 foam = smoothstep(0.08, 0.001, colorBase);
    foam = step(0.5, foam);  // binary step to create foam effect

    // Generate additional noise for waves
    float noiseWaves = snoise(vUv * 300.0 + sin(uTime * -0.1));
    noiseWaves = noiseWaves * 0.5 + 0.5;
    vec3 colorWaves = vec3(noiseWaves);

    // Apply smoothstep for wave thresholding
    float threshold = 0.6 + 0.01 * sin(uTime * 2.0);   // threshold for waves oscillates between 0.6 and 0.61
    vec3 waveEffect = 1.0 - (smoothstep(threshold + 0.03, threshold + 0.032, colorWaves) + 
                             smoothstep(threshold, threshold - 0.01, colorWaves));
    waveEffect = step(0.5, waveEffect) - 0.8;  // binary step to generate wave pattern

    // Combine wave and foam effects
    vec3 combinedEffect = waveEffect + (foam * 2.0);

    // Final color adjustment with a blue tint
    vec3 blueTint = vec3(0.179, 0.971, 1.000);
    vec3 finalColor = (1.0 - combinedEffect) * blueTint + combinedEffect;

    // Output the final color
    gl_FragColor = vec4(finalColor, 0.6);
}
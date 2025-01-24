#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying float vFogDepth;

uniform float uTime;
uniform vec3 uColorNear;
uniform vec3 uColorFar;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFogColor;

#include <packing>

#include "../../../../utils/shaders/functions/functions.glsl"
#include "../../../../utils/shaders/functions/snoise.glsl"

void main() {
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

    // Applying a gradient based on distance
    float vignette = length(vUv - 0.5) * 1.5;
    vec3 baseColor = smoothstep(0.3, 0.9, vec3(vignette));
    baseColor = mix(uColorNear, uColorFar, baseColor);

    vec3 finalColor = (1.0 - combinedEffect) * baseColor + combinedEffect;

    // Managing the alpha based on the distance
    vec3 alpha = foam * 0.5;
    alpha += min(vignette + 0.4, 1.0);

    // Fog
    float fogFactor = smoothstep( uFogNear, uFogFar, vFogDepth * 0.1 );
    finalColor = mix( finalColor, uFogColor, min(1.0, fogFactor + 0.8));

    // Output the final color
    gl_FragColor = vec4(finalColor, alpha);

}
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uDepth;
uniform float uMaxDepth;
uniform vec2 uResolution;
uniform float uCameraNear;
uniform float uCameraFar;
uniform vec3 uColorNear;
uniform vec3 uColorFar;

#include <packing>

#include "../../../../utils/shaders/functions/functions.glsl"
#include "../../../../utils/shaders/functions/snoise.glsl"

float getViewZ(const in float depth) {
    return perspectiveDepthToViewZ(depth, uCameraNear, uCameraFar);
}

float getDepth(const in vec2 screenPosition ) {
    return unpackRGBAToDepth(texture2D(uDepth, screenPosition));
}

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

    
    // Depth
    vec2 screenUV = gl_FragCoord.xy / uResolution;
    float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z);
    float linearEyeDepth = getViewZ(getDepth(screenUV));

    float depth = fragmentLinearEyeDepth - linearEyeDepth;
    
    // Smooth gradient near the edges
    float vignetteCondition = step(0.5, vignette);
    finalColor += mix(0.0, smoothstep(uMaxDepth, 0.0, depth), vignetteCondition);

    float depthCondition = float(depth < uMaxDepth * 0.2 && vignette < 0.2);
    finalColor = mix(finalColor, vec3(1.0), depthCondition);

    // Managing the alpha based on the distance
    vec3 alpha = (foam + depthCondition) * 0.5;
    alpha += min(vignette + 0.4, 1.0);

    // Output the final color
    gl_FragColor = vec4(finalColor, alpha);
}
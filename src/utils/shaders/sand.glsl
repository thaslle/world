vec3 sand(in vec2 vUv, in vec3 baseTint) {
    // Noise base color
    float baseNoise = noise(vUv * 50.0);
    vec3 baseColor = vec3(baseNoise);
    baseColor = baseColor + 0.5;
    baseColor = pow(baseColor, vec3(0.10)); // Apply power curve for contrast

    // Rocks texture
    float dotsNoise = snoise(vUv * 800.0);
    dotsNoise = dotsNoise * 0.5 + 0.5;
    vec3 dotsBaseColor = vec3(dotsNoise);
    vec3 dotsEffect = smoothstep(0.08, 0.001, dotsBaseColor);
    
    // Sand Texture
    float sandThreshold = 0.45;
    float sandBaseNoise = fbm(vUv * 60.0); // Generate sand noise (FBM)
    float sandEffect = smoothstep(sandThreshold, sandThreshold - 0.01, sandBaseNoise);
    
    // Final Color Base
    vec3 finalBase = baseColor * baseTint;

    // Tint Adjustments
    vec3 dotsTintColor = baseTint - 0.15;   // Slightly darkened dots tint
    vec3 sandTintColor = finalBase + vec3(0.01, 0.01, 0.016);  // Slightly lightened sandBase
   
    // Combine finals together
    vec3 finalColor = finalBase;

    finalColor = mix(finalColor, dotsTintColor, dotsEffect);
    finalColor = mix(finalColor, sandTintColor, sandEffect);

    return finalColor;
}

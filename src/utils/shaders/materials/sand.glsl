vec3 sand(in vec3 baseTint, in float vnoise, in float vsnoise, in float vfbm) {
    // Noise base color
    vec3 baseColor = vec3(vnoise);
    baseColor = baseColor + 0.5;
    baseColor = pow(baseColor, vec3(0.10)); // Apply power curve for contrast

    // Rocks texture
    float dotsNoise = vsnoise * 0.5 + 0.5;
    vec3 dotsBaseColor = vec3(dotsNoise);
    vec3 dotsEffect = smoothstep(0.08, 0.001, dotsBaseColor);
    
    // Sand Texture
    float sandThreshold = 0.45;
    float sandEffect = smoothstep(sandThreshold, sandThreshold - 0.01, vfbm);
    
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

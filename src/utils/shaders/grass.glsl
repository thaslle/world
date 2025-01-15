vec3 grass(in vec2 vUv, in vec3 baseTint) {
    // Noise base color
    float baseNoise = noise(vUv * 50.0);
    vec3 baseColor = vec3(baseNoise);
    baseColor = baseColor + 0.5;
    baseColor = pow(baseColor, vec3(0.10)); // Apply power curve for contrast

    // Dots texture
    float dotsNoise = snoise(vUv * 1100.0);
    dotsNoise = dotsNoise * 0.5 + 0.5;
    vec3 dotsBaseColor = vec3(dotsNoise);
    vec3 dotsEffect = smoothstep(0.08, 0.001, dotsBaseColor);
    
    // Grass Texture
    float grassThreshold = 0.45;
    float grassBaseNoise = fbm(vUv * 70.0); // Generate grass noise (FBM)
    float grassEffect = smoothstep(grassThreshold, grassThreshold - 0.01, grassBaseNoise);
    
    // Final Color Base
    vec3 finalBase = baseColor * baseTint;

    // Tint Adjustments
    vec3 dotsTintColor = baseTint - 0.08;   // Slightly darkened dots tint
    vec3 grassTintColor = finalBase + vec3(0.01, 0.01, 0.016);  // Slightly lightened grassBase
    
    // Combine finalall s together
    vec3 finalColor = finalBase;

    finalColor = mix(finalColor, dotsTintColor, dotsEffect);
    finalColor = mix(finalColor, grassTintColor, grassEffect);

    return finalColor;
}

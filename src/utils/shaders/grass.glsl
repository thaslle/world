vec3 grass (in vec2 vUv, in vec3 greenTint) {
    float noiseBase = noise(vUv * 50.0);
    
    vec3 colorBase = vec3(noiseBase);
    colorBase = colorBase + 0.5;
    colorBase = pow(colorBase, vec3(0.10));
    
    // Generate noise for the base texture
    float snoiseBase = snoise(vUv * 3000.0);
    snoiseBase = snoiseBase * 0.5 + 0.5;
    vec3 foamBase = vec3(snoiseBase);

    // Calculate foam effect using smoothstep and thresholding
    vec3 foamColor = smoothstep(0.08, 0.001, foamBase);
    foamColor = step(0.1, foamColor);  // binary step to create foam effect
    
    float t = 0.45;
    float grassBase = smoothstep(t, t - 0.01, fbm(vUv * 70.5));
    vec3 grassColor = vec3(grassBase);

    vec3 foamTint = greenTint - 0.08;
    vec3 grassTint = greenTint + 0.01;
    grassTint.b += 0.012;
    
    vec3 finalColor = (greenTint * (colorBase - foamColor - grassColor))
                      + (foamColor * foamTint)
                      + (grassColor * grassTint);
    
    
    return finalColor;
}

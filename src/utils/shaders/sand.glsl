vec3 sand (in vec2 vUv, in vec3 baseTint) {
    float noiseBase = noise(vUv * 50.0);
    
    vec3 colorBase = vec3(noiseBase);
    colorBase = colorBase + 0.5;
    colorBase = pow(colorBase, vec3(0.10));
    
    // Generate noise for the base texture
    float snoiseBase = snoise(vUv * 4000.0);
    snoiseBase = snoiseBase * 0.5 + 0.5;
    vec3 rockBase = vec3(snoiseBase);

    // Calculate rock effect using smoothstep and thresholding
    vec3 rockColor = smoothstep(0.08, 0.001, rockBase);
    rockColor = step(0.1, rockColor);  // binary step to create rock effect
    
    float t = 0.45;
    float sandBase = smoothstep(t, t - 0.01, fbm(vUv * 70.5));
    vec3 sandColor = vec3(sandBase);

    vec3 rockTint = baseTint - 0.08;
    vec3 sandTint = baseTint + 0.01;
    sandTint.b += 0.014;
    
    vec3 finalColor = (baseTint * (colorBase - rockColor - sandColor))
                      + (rockColor * rockTint)
                      + (sandColor * sandTint);

    // Add gradient based on vUv.y
    //vec3 yTint = baseTint - 0.9;

    //vec3 yTint = vec3(1.0, 0.0, 0.0);
    //finalColor = mix(yTint, finalColor, smoothstep(0.0, 1.0, vUv.y));
    //finalColor = mix(vec3(1.0), vec3(0.0), smoothstep(0.0, 1.0, vUv.y));

    //finalColor = vec3(vUv.x, vUv.y, 0.0);
    
    
    return finalColor;
}
